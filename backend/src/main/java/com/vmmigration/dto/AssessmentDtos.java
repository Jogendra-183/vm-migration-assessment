package com.vmmigration.dto;

import com.vmmigration.entity.Classification;
import com.vmmigration.entity.MigrationPriority;
import com.vmmigration.entity.RiskLevel;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

public class AssessmentDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AssessmentDto {
        private Long id;
        private Long serverId;
        private String serverName;
        private String applicationName;
        private BigDecimal migrationScore;
        private Classification classification;
        private BigDecimal riskScore;
        private RiskLevel riskLevel;
        private BigDecimal priorityScore;
        private MigrationPriority migrationPriority;
        private String reason;
        private OffsetDateTime assessedAt;
        private ScoreBreakdownDto scoreBreakdown;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ScoreBreakdownDto {
        private BigDecimal cpuScore;
        private BigDecimal ramScore;
        private BigDecimal storageScore;
        private BigDecimal networkScore;
        private BigDecimal compatibilityScore;
        private BigDecimal dependencyScore;
        private BigDecimal criticalityScore;
        private BigDecimal weightedTotal;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AssessmentSummaryDto {
        private long totalServers;
        private long readyToMigrate;
        private long requiresOptimization;
        private long retire;
        private long keepPhysical;
        private BigDecimal readinessPercentage;
        private BigDecimal averageMigrationScore;
        private Map<Classification, Long> classificationDistribution;
        private Map<RiskLevel, Long> riskDistribution;
        private Map<MigrationPriority, Long> priorityDistribution;
        private OffsetDateTime lastAssessedAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AssessmentRunResponse {
        private boolean success;
        private String message;
        private int assessedServersCount;
        private AssessmentSummaryDto summary;
        private List<AssessmentDto> results;
    }
}
