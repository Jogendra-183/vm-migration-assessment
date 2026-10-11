package com.vmmigration.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public class ConsolidationDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConsolidationPlanDto {
        private Long id;
        private Integer totalPhysicalServers;
        private Integer migratableServers;
        private Integer retiredServers;
        private Integer physicalServersRemaining;
        private Integer virtualizationHostsRequired;
        private Integer totalVcpuRequired;
        private Integer totalRamRequired;
        private Integer totalStorageRequired;
        private BigDecimal consolidationRatio;
        private OffsetDateTime createdAt;
        private List<HostPlacementDto> hostPlacements;
        private HardwareComparisonDto hardwareComparison;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HostPlacementDto {
        private int hostIndex;
        private String hostName;
        private int allocatedVcpu;
        private int hostVcpuCapacity;
        private int allocatedRamGb;
        private int hostRamCapacityGb;
        private int allocatedStorageGb;
        private int hostStorageCapacityGb;
        private double cpuUtilizationPercentage;
        private double ramUtilizationPercentage;
        private List<String> hostedServerNames;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HardwareComparisonDto {
        private int beforePhysicalHostCount;
        private int afterVirtualHostCount;
        private int beforeTotalCores;
        private int afterTotalVcpu;
        private int beforeTotalRamGb;
        private int afterTotalRamGb;
        private int beforeTotalStorageGb;
        private int afterTotalStorageGb;
        private BigDecimal estimatedPowerSavingsPercent;
        private BigDecimal estimatedRackSpaceSavingsPercent;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConsolidationCustomRequest {
        private Integer customHostVcpu;
        private Integer customHostRamGb;
        private Integer customHostStorageGb;
    }
}
