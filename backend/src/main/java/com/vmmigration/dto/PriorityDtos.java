package com.vmmigration.dto;

import com.vmmigration.entity.Classification;
import com.vmmigration.entity.MigrationPriority;
import com.vmmigration.entity.RiskLevel;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;

public class PriorityDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ServerPriorityDto {
        private Long serverId;
        private String serverName;
        private String applicationName;
        private Classification classification;
        private BigDecimal migrationScore;
        private BigDecimal riskScore;
        private RiskLevel riskLevel;
        private BigDecimal priorityScore;
        private MigrationPriority calculatedPriority;
        private MigrationPriority effectivePriority;
        private boolean isOverridden;
        private String priorityReason;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PriorityOverrideRequest {
        @NotNull(message = "Priority is required")
        private MigrationPriority priority;
        private String overrideReason;
    }
}
