package com.vmmigration.dto;

import lombok.*;
import java.math.BigDecimal;

public class VmDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VmRecommendationDto {
        private Long id;
        private Long serverId;
        private String serverName;
        private String applicationName;
        private Integer currentCpuCores;
        private Integer currentRamGb;
        private Integer currentStorageGb;
        private Integer recommendedVcpu;
        private Integer recommendedRamGb;
        private Integer recommendedStorageGb;
        private BigDecimal recommendedNetworkGbps;
        private BigDecimal safetyMargin;
        private BigDecimal estimatedCpuUtilization;
        private BigDecimal estimatedRamUtilization;
        private String recommendationReason;
        private Integer vcpuSavings;
        private Integer ramSavingsGb;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VmRecommendationSummaryDto {
        private int totalRecommendedVms;
        private int totalPhysicalCores;
        private int totalRecommendedVcpu;
        private int totalPhysicalRamGb;
        private int totalRecommendedRamGb;
        private int totalPhysicalStorageGb;
        private int totalRecommendedStorageGb;
        private BigDecimal cpuCapacityReductionPercent;
        private BigDecimal ramCapacityReductionPercent;
    }
}
