package com.vmmigration.algorithm;

import com.vmmigration.entity.Server;
import com.vmmigration.entity.VmRecommendation;
import com.vmmigration.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
@RequiredArgsConstructor
public class VmSizingEngine {

    private final SystemSettingRepository systemSettingRepository;

    private static final int[] STANDARD_VCPU_TIERS = {1, 2, 4, 6, 8, 12, 16, 20, 24, 32, 48, 64};
    private static final int[] STANDARD_RAM_TIERS = {2, 4, 8, 16, 24, 32, 48, 64, 96, 128, 192, 256, 384, 512};

    public VmRecommendation calculateRecommendation(Server server) {
        BigDecimal safetyMarginPct = getSettingDecimal("vm_safety_margin", BigDecimal.valueOf(20.0));
        double marginMultiplier = 1.0 + (safetyMarginPct.doubleValue() / 100.0);

        // 1. Calculate Required Core capacity
        double peakCpuPercent = server.getPeakCpuUtilization().doubleValue();
        double activeCoresNeeded = (server.getCpuCores() * (peakCpuPercent / 100.0)) * marginMultiplier;
        int recommendedVcpu = fitToStandardTier(activeCoresNeeded, STANDARD_VCPU_TIERS, server.getCpuCores());

        // 2. Calculate Required RAM capacity
        double peakRamPercent = server.getPeakRamUtilization().doubleValue();
        double activeRamNeeded = (server.getTotalRamGb() * (peakRamPercent / 100.0)) * marginMultiplier;
        int recommendedRamGb = fitToStandardTier(activeRamNeeded, STANDARD_RAM_TIERS, server.getTotalRamGb());

        // 3. Storage capacity: match or add 10% headroom if thin-provisioned
        int recommendedStorageGb = server.getTotalStorageGb();

        // 4. Network bandwidth
        BigDecimal recommendedNetworkGbps = server.getNetworkBandwidthGbps() != null
                ? server.getNetworkBandwidthGbps()
                : BigDecimal.valueOf(1.0);

        // 5. Estimated Post-Migration Utilization
        // Estimated CPU % = (active CPU used by workload) / (recommended vCPU) * 100
        double workloadCpuUsage = server.getCpuCores() * (server.getAverageCpuUtilization().doubleValue() / 100.0);
        double estCpuUtil = Math.min(95.0, (workloadCpuUsage / recommendedVcpu) * 100.0);

        double workloadRamUsage = server.getTotalRamGb() * (server.getAverageRamUtilization().doubleValue() / 100.0);
        double estRamUtil = Math.min(95.0, (workloadRamUsage / recommendedRamGb) * 100.0);

        String reason = String.format("Right-sized from physical %d cores / %d GB RAM based on peak load (CPU: %.1f%%, RAM: %.1f%%) with a %.0f%% safety buffer. Projected post-migration utilization: %.1f%% CPU, %.1f%% RAM.",
                server.getCpuCores(), server.getTotalRamGb(), peakCpuPercent, peakRamPercent, safetyMarginPct.doubleValue(), estCpuUtil, estRamUtil);

        return VmRecommendation.builder()
                .server(server)
                .recommendedVcpu(recommendedVcpu)
                .recommendedRamGb(recommendedRamGb)
                .recommendedStorageGb(recommendedStorageGb)
                .recommendedNetworkGbps(recommendedNetworkGbps)
                .safetyMargin(safetyMarginPct)
                .estimatedCpuUtilization(BigDecimal.valueOf(estCpuUtil).setScale(2, RoundingMode.HALF_UP))
                .estimatedRamUtilization(BigDecimal.valueOf(estRamUtil).setScale(2, RoundingMode.HALF_UP))
                .recommendationReason(reason)
                .build();
    }

    private int fitToStandardTier(double neededValue, int[] tiers, int originalPhysicalMax) {
        int target = Math.max(1, (int) Math.ceil(neededValue));
        for (int tier : tiers) {
            if (tier >= target) {
                return Math.min(tier, originalPhysicalMax);
            }
        }
        return originalPhysicalMax;
    }

    private BigDecimal getSettingDecimal(String key, BigDecimal defaultValue) {
        return systemSettingRepository.findBySettingKey(key)
                .map(s -> {
                    try {
                        return new BigDecimal(s.getSettingValue());
                    } catch (Exception e) {
                        return defaultValue;
                    }
                })
                .orElse(defaultValue);
    }
}
