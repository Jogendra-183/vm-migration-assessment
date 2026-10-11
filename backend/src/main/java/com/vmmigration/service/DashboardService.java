package com.vmmigration.service;

import com.vmmigration.algorithm.ConsolidationEngine;
import com.vmmigration.dto.ConsolidationDtos.ConsolidationPlanDto;
import com.vmmigration.dto.DashboardDtos.*;
import com.vmmigration.entity.*;
import com.vmmigration.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ServerRepository serverRepository;
    private final AssessmentRepository assessmentRepository;
    private final MigrationWaveRepository waveRepository;
    private final ConsolidationEngine consolidationEngine;

    public DashboardStatsDto getDashboardStats() {
        List<Server> servers = serverRepository.findAll();
        List<Assessment> assessments = assessmentRepository.findAll();
        List<MigrationWave> waves = waveRepository.findAllByOrderByWaveNumberAsc();

        long totalServers = servers.size();
        if (totalServers == 0) {
            return buildEmptyDashboard();
        }

        // Classification counts
        long ready = assessments.stream().filter(a -> a.getClassification() == Classification.READY_TO_MIGRATE).count();
        long opt = assessments.stream().filter(a -> a.getClassification() == Classification.REQUIRES_OPTIMIZATION).count();
        long keep = assessments.stream().filter(a -> a.getClassification() == Classification.KEEP_PHYSICAL).count();
        long retire = assessments.stream().filter(a -> a.getClassification() == Classification.RETIRE).count();

        double readinessPct = ((double) ready / totalServers) * 100.0;
        long highRiskCount = assessments.stream().filter(a -> a.getRiskLevel() == RiskLevel.HIGH || a.getRiskLevel() == RiskLevel.CRITICAL).count();

        // Averages
        double avgCpu = servers.stream().mapToDouble(s -> s.getAverageCpuUtilization().doubleValue()).average().orElse(0.0);
        double avgRam = servers.stream().mapToDouble(s -> s.getAverageRamUtilization().doubleValue()).average().orElse(0.0);
        double avgStorage = servers.stream().mapToDouble(s -> s.getAverageStorageUtilization().doubleValue()).average().orElse(0.0);
        double avgNetwork = servers.stream().mapToDouble(s -> s.getAverageNetworkUtilization().doubleValue()).average().orElse(0.0);

        // Consolidation
        ConsolidationPlanDto consolidation = consolidationEngine.calculateConsolidation(null, null, null);

        // Chart 1: Classification
        List<ClassificationDistributionDto> classificationChart = Arrays.asList(
                ClassificationDistributionDto.builder().classification(Classification.READY_TO_MIGRATE).label("Ready to Migrate").count(ready).percentage(roundPct(ready, totalServers)).colorHex("#10B981").build(),
                ClassificationDistributionDto.builder().classification(Classification.REQUIRES_OPTIMIZATION).label("Requires Optimization").count(opt).percentage(roundPct(opt, totalServers)).colorHex("#F59E0B").build(),
                ClassificationDistributionDto.builder().classification(Classification.KEEP_PHYSICAL).label("Keep Physical").count(keep).percentage(roundPct(keep, totalServers)).colorHex("#EF4444").build(),
                ClassificationDistributionDto.builder().classification(Classification.RETIRE).label("Retire").count(retire).percentage(roundPct(retire, totalServers)).colorHex("#6B7280").build()
        );

        // Chart 2: Risk
        long lowRisk = assessments.stream().filter(a -> a.getRiskLevel() == RiskLevel.LOW).count();
        long medRisk = assessments.stream().filter(a -> a.getRiskLevel() == RiskLevel.MEDIUM).count();
        long highRisk = assessments.stream().filter(a -> a.getRiskLevel() == RiskLevel.HIGH).count();
        long critRisk = assessments.stream().filter(a -> a.getRiskLevel() == RiskLevel.CRITICAL).count();

        List<RiskDistributionDto> riskChart = Arrays.asList(
                RiskDistributionDto.builder().riskLevel(RiskLevel.LOW).label("Low Risk").count(lowRisk).percentage(roundPct(lowRisk, totalServers)).colorHex("#10B981").build(),
                RiskDistributionDto.builder().riskLevel(RiskLevel.MEDIUM).label("Medium Risk").count(medRisk).percentage(roundPct(medRisk, totalServers)).colorHex("#3B82F6").build(),
                RiskDistributionDto.builder().riskLevel(RiskLevel.HIGH).label("High Risk").count(highRisk).percentage(roundPct(highRisk, totalServers)).colorHex("#F59E0B").build(),
                RiskDistributionDto.builder().riskLevel(RiskLevel.CRITICAL).label("Critical Risk").count(critRisk).percentage(roundPct(critRisk, totalServers)).colorHex("#EF4444").build()
        );

        // Chart 3: Priority
        long p1 = assessments.stream().filter(a -> a.getMigrationPriority() == MigrationPriority.PRIORITY_1).count();
        long p2 = assessments.stream().filter(a -> a.getMigrationPriority() == MigrationPriority.PRIORITY_2).count();
        long p3 = assessments.stream().filter(a -> a.getMigrationPriority() == MigrationPriority.PRIORITY_3).count();
        long p4 = assessments.stream().filter(a -> a.getMigrationPriority() == MigrationPriority.PRIORITY_4).count();

        List<PriorityDistributionDto> priorityChart = Arrays.asList(
                PriorityDistributionDto.builder().priority(MigrationPriority.PRIORITY_1).label("Priority 1 (Pilot/Quick Wins)").count(p1).build(),
                PriorityDistributionDto.builder().priority(MigrationPriority.PRIORITY_2).label("Priority 2 (Core Tier)").count(p2).build(),
                PriorityDistributionDto.builder().priority(MigrationPriority.PRIORITY_3).label("Priority 3 (Complex/Critical)").count(p3).build(),
                PriorityDistributionDto.builder().priority(MigrationPriority.PRIORITY_4).label("Priority 4 (Deferred/Long-Term)").count(p4).build()
        );

        // Chart 4: Wave Progress
        List<WaveProgressDto> waveProgressChart = new ArrayList<>();
        for (MigrationWave w : waves) {
            waveProgressChart.add(WaveProgressDto.builder()
                    .waveNumber(w.getWaveNumber())
                    .waveName(w.getWaveName())
                    .serverCount(w.getWaveServers() != null ? w.getWaveServers().size() : 0)
                    .status(w.getStatus().name())
                    .plannedDate(w.getPlannedDate() != null ? w.getPlannedDate().toString() : "TBD")
                    .build());
        }

        // Chart 5: CPU & RAM Utilization Buckets
        List<UtilizationBucketDto> cpuBuckets = Arrays.asList(
                new UtilizationBucketDto("0–20%", (int) servers.stream().filter(s -> s.getAverageCpuUtilization().doubleValue() < 20).count()),
                new UtilizationBucketDto("20–40%", (int) servers.stream().filter(s -> s.getAverageCpuUtilization().doubleValue() >= 20 && s.getAverageCpuUtilization().doubleValue() < 40).count()),
                new UtilizationBucketDto("40–60%", (int) servers.stream().filter(s -> s.getAverageCpuUtilization().doubleValue() >= 40 && s.getAverageCpuUtilization().doubleValue() < 60).count()),
                new UtilizationBucketDto("60–80%", (int) servers.stream().filter(s -> s.getAverageCpuUtilization().doubleValue() >= 60 && s.getAverageCpuUtilization().doubleValue() < 80).count()),
                new UtilizationBucketDto("80–100%", (int) servers.stream().filter(s -> s.getAverageCpuUtilization().doubleValue() >= 80).count())
        );

        List<UtilizationBucketDto> ramBuckets = Arrays.asList(
                new UtilizationBucketDto("0–25%", (int) servers.stream().filter(s -> s.getAverageRamUtilization().doubleValue() < 25).count()),
                new UtilizationBucketDto("25–50%", (int) servers.stream().filter(s -> s.getAverageRamUtilization().doubleValue() >= 25 && s.getAverageRamUtilization().doubleValue() < 50).count()),
                new UtilizationBucketDto("50–75%", (int) servers.stream().filter(s -> s.getAverageRamUtilization().doubleValue() >= 50 && s.getAverageRamUtilization().doubleValue() < 75).count()),
                new UtilizationBucketDto("75–100%", (int) servers.stream().filter(s -> s.getAverageRamUtilization().doubleValue() >= 75).count())
        );

        int physCores = servers.stream().mapToInt(Server::getCpuCores).sum();
        int physRam = servers.stream().mapToInt(Server::getTotalRamGb).sum();
        int physStorage = servers.stream().mapToInt(Server::getTotalStorageGb).sum();

        InfrastructureSummaryDto infraComparison = InfrastructureSummaryDto.builder()
                .physicalServersCount((int) totalServers)
                .physicalTotalCores(physCores)
                .physicalTotalRamGb(physRam)
                .physicalTotalStorageGb(physStorage)
                .targetVirtualHostsCount(consolidation.getVirtualizationHostsRequired())
                .targetTotalVcpu(consolidation.getTotalVcpuRequired())
                .targetTotalRamGb(consolidation.getTotalRamRequired())
                .targetTotalStorageGb(consolidation.getTotalStorageRequired())
                .coreReductionPercent(consolidation.getHardwareComparison() != null ? BigDecimal.valueOf(((double) (physCores - consolidation.getTotalVcpuRequired()) / physCores) * 100.0).setScale(1, RoundingMode.HALF_UP) : BigDecimal.ZERO)
                .ramReductionPercent(consolidation.getHardwareComparison() != null ? BigDecimal.valueOf(((double) (physRam - consolidation.getTotalRamRequired()) / physRam) * 100.0).setScale(1, RoundingMode.HALF_UP) : BigDecimal.ZERO)
                .build();

        return DashboardStatsDto.builder()
                .totalServers(totalServers)
                .readyToMigrate(ready)
                .requiresOptimization(opt)
                .keepPhysical(keep)
                .retire(retire)
                .migrationReadinessPercent(BigDecimal.valueOf(readinessPct).setScale(1, RoundingMode.HALF_UP))
                .highRiskServersCount(highRiskCount)
                .recommendedVmCount(consolidation.getMigratableServers())
                .virtualizationHostsRequired(consolidation.getVirtualizationHostsRequired())
                .consolidationRatio(consolidation.getConsolidationRatio())
                .averageCpuUtilization(BigDecimal.valueOf(avgCpu).setScale(1, RoundingMode.HALF_UP))
                .averageRamUtilization(BigDecimal.valueOf(avgRam).setScale(1, RoundingMode.HALF_UP))
                .averageStorageUtilization(BigDecimal.valueOf(avgStorage).setScale(1, RoundingMode.HALF_UP))
                .averageNetworkUtilization(BigDecimal.valueOf(avgNetwork).setScale(1, RoundingMode.HALF_UP))
                .classificationChart(classificationChart)
                .riskChart(riskChart)
                .priorityChart(priorityChart)
                .waveProgressChart(waveProgressChart)
                .cpuUtilizationBuckets(cpuBuckets)
                .ramUtilizationBuckets(ramBuckets)
                .infrastructureComparison(infraComparison)
                .build();
    }

    private double roundPct(long count, long total) {
        if (total == 0) return 0.0;
        return Math.round(((double) count / total) * 1000.0) / 10.0;
    }

    private DashboardStatsDto buildEmptyDashboard() {
        return DashboardStatsDto.builder()
                .totalServers(0)
                .readyToMigrate(0)
                .requiresOptimization(0)
                .keepPhysical(0)
                .retire(0)
                .migrationReadinessPercent(BigDecimal.ZERO)
                .highRiskServersCount(0)
                .recommendedVmCount(0)
                .virtualizationHostsRequired(0)
                .consolidationRatio(BigDecimal.valueOf(1.0))
                .averageCpuUtilization(BigDecimal.ZERO)
                .averageRamUtilization(BigDecimal.ZERO)
                .averageStorageUtilization(BigDecimal.ZERO)
                .averageNetworkUtilization(BigDecimal.ZERO)
                .classificationChart(Collections.emptyList())
                .riskChart(Collections.emptyList())
                .priorityChart(Collections.emptyList())
                .waveProgressChart(Collections.emptyList())
                .cpuUtilizationBuckets(Collections.emptyList())
                .ramUtilizationBuckets(Collections.emptyList())
                .infrastructureComparison(InfrastructureSummaryDto.builder().build())
                .build();
    }
}
