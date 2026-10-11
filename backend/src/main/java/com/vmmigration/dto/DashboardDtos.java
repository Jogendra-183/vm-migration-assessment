package com.vmmigration.dto;

import com.vmmigration.entity.Classification;
import com.vmmigration.entity.MigrationPriority;
import com.vmmigration.entity.RiskLevel;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

public class DashboardDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DashboardStatsDto {
        // High Level Server Counts
        private long totalServers;
        private long readyToMigrate;
        private long requiresOptimization;
        private long keepPhysical;
        private long retire;
        private BigDecimal migrationReadinessPercent;
        private long highRiskServersCount;
        private int recommendedVmCount;
        private int virtualizationHostsRequired;
        private BigDecimal consolidationRatio;

        // Averages
        private BigDecimal averageCpuUtilization;
        private BigDecimal averageRamUtilization;
        private BigDecimal averageStorageUtilization;
        private BigDecimal averageNetworkUtilization;

        // Distributions for Charts
        private List<ClassificationDistributionDto> classificationChart;
        private List<RiskDistributionDto> riskChart;
        private List<PriorityDistributionDto> priorityChart;
        private List<WaveProgressDto> waveProgressChart;
        private List<UtilizationBucketDto> cpuUtilizationBuckets;
        private List<UtilizationBucketDto> ramUtilizationBuckets;
        private InfrastructureSummaryDto infrastructureComparison;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ClassificationDistributionDto {
        private Classification classification;
        private String label;
        private long count;
        private double percentage;
        private String colorHex;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RiskDistributionDto {
        private RiskLevel riskLevel;
        private String label;
        private long count;
        private double percentage;
        private String colorHex;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PriorityDistributionDto {
        private MigrationPriority priority;
        private String label;
        private long count;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WaveProgressDto {
        private int waveNumber;
        private String waveName;
        private int serverCount;
        private String status;
        private String plannedDate;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UtilizationBucketDto {
        private String rangeLabel; // e.g. "0-20%", "20-40%"
        private int count;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InfrastructureSummaryDto {
        private int physicalServersCount;
        private int physicalTotalCores;
        private int physicalTotalRamGb;
        private int physicalTotalStorageGb;
        private int targetVirtualHostsCount;
        private int targetTotalVcpu;
        private int targetTotalRamGb;
        private int targetTotalStorageGb;
        private BigDecimal coreReductionPercent;
        private BigDecimal ramReductionPercent;
    }
}
