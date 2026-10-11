package com.vmmigration.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public class ReportDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExecutiveSummaryReportDto {
        private String projectName;
        private OffsetDateTime generatedAt;
        private int totalPhysicalServers;
        private int readyToMigrateCount;
        private int requiresOptimizationCount;
        private int keepPhysicalCount;
        private int retireCount;
        private BigDecimal migrationReadinessPercent;
        private int lowRiskCount;
        private int mediumRiskCount;
        private int highRiskCount;
        private int criticalRiskCount;
        private int recommendedVmCount;
        private int requiredVirtualHosts;
        private BigDecimal consolidationRatio;
        private int totalPhysicalCores;
        private int totalVirtualVcpu;
        private int totalPhysicalRamGb;
        private int totalVirtualRamGb;
        private BigDecimal estimatedPowerSavingsPercent;
        private List<ServerDtos.ServerDto> serversList;
        private List<WaveDtos.MigrationWaveDto> wavesList;
        private List<DependencyDtos.DependencyDto> dependenciesList;
        private List<String> keyRecommendations;
    }
}
