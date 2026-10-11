package com.vmmigration.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public class PerformanceDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PerformanceMetricDto {
        private Long id;
        private Long serverId;
        private OffsetDateTime timestamp;
        private BigDecimal cpuUtilization;
        private BigDecimal ramUtilization;
        private BigDecimal storageUtilization;
        private BigDecimal networkUtilization;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PerformanceMetricCreateRequest {
        @NotNull(message = "Server ID is required")
        private Long serverId;

        @NotNull(message = "CPU utilization is required")
        @DecimalMin("0.0") @DecimalMax("100.0")
        private BigDecimal cpuUtilization;

        @NotNull(message = "RAM utilization is required")
        @DecimalMin("0.0") @DecimalMax("100.0")
        private BigDecimal ramUtilization;

        @NotNull(message = "Storage utilization is required")
        @DecimalMin("0.0") @DecimalMax("100.0")
        private BigDecimal storageUtilization;

        @NotNull(message = "Network utilization is required")
        @DecimalMin("0.0") @DecimalMax("100.0")
        private BigDecimal networkUtilization;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ServerTelemetryDto {
        private Long serverId;
        private String serverName;
        private BigDecimal currentAvgCpu;
        private BigDecimal currentPeakCpu;
        private BigDecimal currentAvgRam;
        private BigDecimal currentPeakRam;
        private BigDecimal currentAvgStorage;
        private BigDecimal currentAvgNetwork;
        private List<PerformanceMetricDto> historicalMetrics;
    }
}
