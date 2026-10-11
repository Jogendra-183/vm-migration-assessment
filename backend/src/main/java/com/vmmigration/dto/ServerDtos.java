package com.vmmigration.dto;

import com.vmmigration.entity.BusinessCriticality;
import com.vmmigration.entity.Classification;
import com.vmmigration.entity.DowntimeRequirement;
import com.vmmigration.entity.MigrationPriority;
import com.vmmigration.entity.RiskLevel;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public class ServerDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ServerDto {
        private Long id;
        private String serverName;
        private String hostname;
        private String ipAddress;
        private String operatingSystem;
        private String osVersion;
        private String cpuModel;
        private Integer cpuCores;
        private Integer totalRamGb;
        private Integer totalStorageGb;
        private String storageType;
        private BigDecimal networkBandwidthGbps;
        private BigDecimal averageCpuUtilization;
        private BigDecimal peakCpuUtilization;
        private BigDecimal averageRamUtilization;
        private BigDecimal peakRamUtilization;
        private BigDecimal averageStorageUtilization;
        private BigDecimal averageNetworkUtilization;
        private String applicationName;
        private String applicationType;
        private String applicationOwner;
        private BusinessCriticality businessCriticality;
        private DowntimeRequirement downtimeRequirement;
        private Boolean hardwareDependency;
        private Boolean virtualizationCompatibility;
        private BigDecimal serverAgeYears;
        private String maintenanceStatus;
        private String currentStatus;
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;

        // Quick references to assessment & wave if available
        private BigDecimal migrationScore;
        private Classification classification;
        private RiskLevel riskLevel;
        private BigDecimal riskScore;
        private MigrationPriority migrationPriority;
        private Integer recommendedVcpu;
        private Integer recommendedRamGb;
        private Integer recommendedStorageGb;
        private Integer assignedWaveNumber;
        private String assignedWaveName;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ServerCreateRequest {
        @NotBlank(message = "Server name is required")
        private String serverName;

        @NotBlank(message = "Hostname is required")
        private String hostname;

        @NotBlank(message = "IP address is required")
        private String ipAddress;

        @NotBlank(message = "Operating system is required")
        private String operatingSystem;

        @NotBlank(message = "OS version is required")
        private String osVersion;

        @NotBlank(message = "CPU model is required")
        private String cpuModel;

        @NotNull(message = "CPU cores is required")
        @Min(value = 1, message = "CPU cores must be at least 1")
        private Integer cpuCores;

        @NotNull(message = "RAM is required")
        @Min(value = 1, message = "RAM must be at least 1 GB")
        private Integer totalRamGb;

        @NotNull(message = "Storage is required")
        @Min(value = 1, message = "Storage must be at least 1 GB")
        private Integer totalStorageGb;

        @NotBlank(message = "Storage type is required")
        private String storageType;

        @DecimalMin("0.0")
        private BigDecimal networkBandwidthGbps;

        @NotNull(message = "Avg CPU utilization is required")
        @DecimalMin("0.0") @DecimalMax("100.0")
        private BigDecimal averageCpuUtilization;

        @NotNull(message = "Peak CPU utilization is required")
        @DecimalMin("0.0") @DecimalMax("100.0")
        private BigDecimal peakCpuUtilization;

        @NotNull(message = "Avg RAM utilization is required")
        @DecimalMin("0.0") @DecimalMax("100.0")
        private BigDecimal averageRamUtilization;

        @NotNull(message = "Peak RAM utilization is required")
        @DecimalMin("0.0") @DecimalMax("100.0")
        private BigDecimal peakRamUtilization;

        @NotNull(message = "Avg Storage utilization is required")
        @DecimalMin("0.0") @DecimalMax("100.0")
        private BigDecimal averageStorageUtilization;

        @NotNull(message = "Avg Network utilization is required")
        @DecimalMin("0.0") @DecimalMax("100.0")
        private BigDecimal averageNetworkUtilization;

        @NotBlank(message = "Application name is required")
        private String applicationName;

        @NotBlank(message = "Application type is required")
        private String applicationType;

        @NotBlank(message = "Application owner is required")
        private String applicationOwner;

        @NotNull(message = "Business criticality is required")
        private BusinessCriticality businessCriticality;

        @NotNull(message = "Downtime requirement is required")
        private DowntimeRequirement downtimeRequirement;

        private Boolean hardwareDependency;
        private Boolean virtualizationCompatibility;
        private BigDecimal serverAgeYears;
        private String maintenanceStatus;
        private String currentStatus;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ServerUpdateRequest {
        private String hostname;
        private String ipAddress;
        private String operatingSystem;
        private String osVersion;
        private String cpuModel;
        private Integer cpuCores;
        private Integer totalRamGb;
        private Integer totalStorageGb;
        private String storageType;
        private BigDecimal networkBandwidthGbps;
        private BigDecimal averageCpuUtilization;
        private BigDecimal peakCpuUtilization;
        private BigDecimal averageRamUtilization;
        private BigDecimal peakRamUtilization;
        private BigDecimal averageStorageUtilization;
        private BigDecimal averageNetworkUtilization;
        private String applicationName;
        private String applicationType;
        private String applicationOwner;
        private BusinessCriticality businessCriticality;
        private DowntimeRequirement downtimeRequirement;
        private Boolean hardwareDependency;
        private Boolean virtualizationCompatibility;
        private BigDecimal serverAgeYears;
        private String maintenanceStatus;
        private String currentStatus;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ServerDetailDto {
        private ServerDto server;
        private AssessmentDtos.AssessmentDto assessment;
        private VmDtos.VmRecommendationDto vmRecommendation;
        private List<DependencyDtos.DependencyDto> dependencies;
        private List<PerformanceDtos.PerformanceMetricDto> performanceMetrics;
        private WaveDtos.MigrationWaveServerDto waveAssignment;
        private SizingComparisonDto sizingComparison;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SizingComparisonDto {
        private Integer physicalCores;
        private Integer physicalRamGb;
        private Integer physicalStorageGb;
        private Integer recommendedVcpu;
        private Integer recommendedRamGb;
        private Integer recommendedStorageGb;
        private BigDecimal cpuHeadroomSavingsPercent;
        private BigDecimal ramHeadroomSavingsPercent;
        private BigDecimal estimatedPostMigCpuUtil;
        private BigDecimal estimatedPostMigRamUtil;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ImportSummaryDto {
        private int totalProcessed;
        private int successfulImports;
        private int failedImports;
        private List<String> errors;
    }
}
