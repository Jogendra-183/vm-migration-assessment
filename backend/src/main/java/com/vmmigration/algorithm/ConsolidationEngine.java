package com.vmmigration.algorithm;

import com.vmmigration.dto.ConsolidationDtos.*;
import com.vmmigration.entity.*;
import com.vmmigration.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ConsolidationEngine {

    private final ServerRepository serverRepository;
    private final ConsolidationPlanRepository consolidationPlanRepository;
    private final SystemSettingRepository systemSettingRepository;

    @Transactional
    public ConsolidationPlanDto calculateConsolidation(Integer customHostVcpu, Integer customHostRamGb, Integer customHostStorageGb) {
        List<Server> allServers = serverRepository.findAll();
        int totalPhysicalServers = allServers.size();

        int hostVcpuCap = customHostVcpu != null ? customHostVcpu : getSettingInt("host_vcpu_capacity", 64);
        int hostRamCap = customHostRamGb != null ? customHostRamGb : getSettingInt("host_ram_capacity_gb", 256);
        int hostStorageCap = customHostStorageGb != null ? customHostStorageGb : getSettingInt("host_storage_capacity_gb", 10240);

        int migratableCount = 0;
        int retiredCount = 0;
        int keepPhysicalCount = 0;

        int beforeTotalCores = 0;
        int beforeTotalRamGb = 0;
        int beforeTotalStorageGb = 0;

        List<VmCandidate> candidates = new ArrayList<>();

        for (Server s : allServers) {
            beforeTotalCores += s.getCpuCores();
            beforeTotalRamGb += s.getTotalRamGb();
            beforeTotalStorageGb += s.getTotalStorageGb();

            Assessment assessment = s.getAssessment();
            Classification classification = assessment != null ? assessment.getClassification() : Classification.READY_TO_MIGRATE;

            if (classification == Classification.RETIRE) {
                retiredCount++;
            } else if (classification == Classification.KEEP_PHYSICAL) {
                keepPhysicalCount++;
            } else {
                migratableCount++;
                VmRecommendation rec = s.getVmRecommendation();
                int vcpu = rec != null ? rec.getRecommendedVcpu() : Math.max(1, s.getCpuCores() / 2);
                int ram = rec != null ? rec.getRecommendedRamGb() : Math.max(2, s.getTotalRamGb() / 2);
                int storage = rec != null ? rec.getRecommendedStorageGb() : s.getTotalStorageGb();

                candidates.add(new VmCandidate(s.getServerName(), vcpu, ram, storage));
            }
        }

        // Multi-dimensional Bin Packing: Pack VMs into Hypervisor Hosts
        List<HostBin> hostBins = new ArrayList<>();
        int totalVcpuRequired = 0;
        int totalRamRequired = 0;
        int totalStorageRequired = 0;

        // Sort candidates descending by RAM / vCPU requirements for first-fit decreasing bin packing
        candidates.sort((a, b) -> Integer.compare(b.ramGb, a.ramGb));

        for (VmCandidate vm : candidates) {
            totalVcpuRequired += vm.vcpu;
            totalRamRequired += vm.ramGb;
            totalStorageRequired += vm.storageGb;

            boolean placed = false;
            for (HostBin bin : hostBins) {
                if (bin.canFit(vm, hostVcpuCap, hostRamCap, hostStorageCap)) {
                    bin.addVm(vm);
                    placed = true;
                    break;
                }
            }

            if (!placed) {
                HostBin newBin = new HostBin(hostBins.size() + 1, "Hypervisor-Host-" + String.format("%02d", hostBins.size() + 1));
                newBin.addVm(vm);
                hostBins.add(newBin);
            }
        }

        int requiredHosts = Math.max(1, hostBins.size());
        double ratio = requiredHosts > 0 ? (double) migratableCount / requiredHosts : 1.0;
        BigDecimal consolidationRatio = BigDecimal.valueOf(ratio).setScale(2, RoundingMode.HALF_UP);

        // Save consolidation plan to database
        ConsolidationPlan plan = ConsolidationPlan.builder()
                .totalPhysicalServers(totalPhysicalServers)
                .migratableServers(migratableCount)
                .retiredServers(retiredCount)
                .physicalServersRemaining(keepPhysicalCount)
                .virtualizationHostsRequired(requiredHosts)
                .totalVcpuRequired(totalVcpuRequired)
                .totalRamRequired(totalRamRequired)
                .totalStorageRequired(totalStorageRequired)
                .consolidationRatio(consolidationRatio)
                .build();

        consolidationPlanRepository.save(plan);

        // Convert host placements to DTO
        List<HostPlacementDto> placementDtos = new ArrayList<>();
        for (HostBin bin : hostBins) {
            placementDtos.add(HostPlacementDto.builder()
                    .hostIndex(bin.index)
                    .hostName(bin.name)
                    .allocatedVcpu(bin.usedVcpu)
                    .hostVcpuCapacity(hostVcpuCap)
                    .allocatedRamGb(bin.usedRam)
                    .hostRamCapacityGb(hostRamCap)
                    .allocatedStorageGb(bin.usedStorage)
                    .hostStorageCapacityGb(hostStorageCap)
                    .cpuUtilizationPercentage(Math.round(((double) bin.usedVcpu / hostVcpuCap) * 1000.0) / 10.0)
                    .ramUtilizationPercentage(Math.round(((double) bin.usedRam / hostRamCap) * 1000.0) / 10.0)
                    .hostedServerNames(bin.serverNames)
                    .build());
        }

        // Compute power & rack space reduction estimations
        double powerSavings = totalPhysicalServers > 0
                ? ((double) (totalPhysicalServers - (requiredHosts + keepPhysicalCount)) / totalPhysicalServers) * 78.0
                : 0.0;
        double rackSavings = totalPhysicalServers > 0
                ? ((double) (totalPhysicalServers - (requiredHosts + keepPhysicalCount)) / totalPhysicalServers) * 72.0
                : 0.0;

        HardwareComparisonDto hardwareComparison = HardwareComparisonDto.builder()
                .beforePhysicalHostCount(totalPhysicalServers)
                .afterVirtualHostCount(requiredHosts + keepPhysicalCount)
                .beforeTotalCores(beforeTotalCores)
                .afterTotalVcpu(totalVcpuRequired)
                .beforeTotalRamGb(beforeTotalRamGb)
                .afterTotalRamGb(totalRamRequired)
                .beforeTotalStorageGb(beforeTotalStorageGb)
                .afterTotalStorageGb(totalStorageRequired)
                .estimatedPowerSavingsPercent(BigDecimal.valueOf(powerSavings).setScale(1, RoundingMode.HALF_UP))
                .estimatedRackSpaceSavingsPercent(BigDecimal.valueOf(rackSavings).setScale(1, RoundingMode.HALF_UP))
                .build();

        return ConsolidationPlanDto.builder()
                .id(plan.getId())
                .totalPhysicalServers(totalPhysicalServers)
                .migratableServers(migratableCount)
                .retiredServers(retiredCount)
                .physicalServersRemaining(keepPhysicalCount)
                .virtualizationHostsRequired(requiredHosts)
                .totalVcpuRequired(totalVcpuRequired)
                .totalRamRequired(totalRamRequired)
                .totalStorageRequired(totalStorageRequired)
                .consolidationRatio(consolidationRatio)
                .createdAt(plan.getCreatedAt())
                .hostPlacements(placementDtos)
                .hardwareComparison(hardwareComparison)
                .build();
    }

    private static class VmCandidate {
        String name;
        int vcpu;
        int ramGb;
        int storageGb;

        VmCandidate(String name, int vcpu, int ramGb, int storageGb) {
            this.name = name;
            this.vcpu = vcpu;
            this.ramGb = ramGb;
            this.storageGb = storageGb;
        }
    }

    private static class HostBin {
        int index;
        String name;
        int usedVcpu = 0;
        int usedRam = 0;
        int usedStorage = 0;
        List<String> serverNames = new ArrayList<>();

        HostBin(int index, String name) {
            this.index = index;
            this.name = name;
        }

        boolean canFit(VmCandidate vm, int maxVcpu, int maxRam, int maxStorage) {
            return (usedVcpu + vm.vcpu <= maxVcpu) &&
                   (usedRam + vm.ramGb <= maxRam) &&
                   (usedStorage + vm.storageGb <= maxStorage);
        }

        void addVm(VmCandidate vm) {
            this.usedVcpu += vm.vcpu;
            this.usedRam += vm.ramGb;
            this.usedStorage += vm.storageGb;
            this.serverNames.add(vm.name);
        }
    }

    private int getSettingInt(String key, int defaultValue) {
        return systemSettingRepository.findBySettingKey(key)
                .map(s -> {
                    try {
                        return Integer.parseInt(s.getSettingValue());
                    } catch (Exception e) {
                        return defaultValue;
                    }
                })
                .orElse(defaultValue);
    }
}
