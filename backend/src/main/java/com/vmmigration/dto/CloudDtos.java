package com.vmmigration.dto;

import com.vmmigration.entity.Classification;
import com.vmmigration.entity.CloudVmStatus;
import com.vmmigration.entity.ProvisioningStatus;
import com.vmmigration.entity.RiskLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public class CloudDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CloudHealthDto {
        private boolean connected;
        private String projectId;
        private String authenticatedAccount;
        private String defaultRegion;
        private String defaultZone;
        private boolean apiEnabled;
        private boolean mockMode;
        private long activeVmCount;
        private String message;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MachineTypeOptionDto {
        private String name;
        private String family;
        private int vcpu;
        private double memoryGb;
        private String description;
        private BigDecimal estimatedMonthlyCostUsd;
        private BigDecimal estimatedMonthlyCostInr;
        private String recommendedFor;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProvisioningPreviewRequest {
        @NotNull(message = "Server ID is required")
        private Long serverId;
        private String preferredZone;
        private String overrideMachineType;
        private Integer bootDiskSizeGb;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProvisioningPreviewResponse {
        private Long serverId;
        private String serverName;
        private String sourceOs;
        private int sourceCores;
        private int sourceRamGb;
        private int sourceStorageGb;
        private BigDecimal migrationScore;
        private Classification classification;
        private RiskLevel riskLevel;
        private boolean eligibleForProvisioning;
        private List<String> warnings;
        private String recommendedMachineType;
        private int recommendedVcpu;
        private BigDecimal recommendedRamGb;
        private int recommendedDiskGb;
        private String recommendedDiskType;
        private String bootImage;
        private String zone;
        private String network;
        private BigDecimal estimatedHourlyCostUsd;
        private BigDecimal estimatedMonthlyCostUsd;
        private BigDecimal estimatedMonthlyCostInr;
        private String costAssumptions;
        private String trialCreditsNotice;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateProvisioningRequestDto {
        @NotNull(message = "Server ID is required")
        private Long serverId;
        private String instanceName;
        private String zone;
        private String machineType;
        private Integer bootDiskSizeGb;
        private String bootImage;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApproveProvisioningRequestDto {
        @NotNull(message = "Approval status must be specified")
        private Boolean approved;
        private String comment;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProvisioningRequestDto {
        private Long id;
        private Long sourceServerId;
        private String sourceServerName;
        private String instanceName;
        private String projectId;
        private String zone;
        private String machineType;
        private Integer vcpu;
        private BigDecimal ramGb;
        private Integer bootDiskSizeGb;
        private String bootDiskType;
        private String bootImage;
        private String vpcNetwork;
        private ProvisioningStatus status;
        private String requestedBy;
        private String approvedBy;
        private String approvalComment;
        private OffsetDateTime approvedAt;
        private String operationId;
        private String errorMessage;
        private BigDecimal estimatedMonthlyCost;
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CloudVmDto {
        private Long id;
        private Long sourceServerId;
        private String sourceServerName;
        private String instanceName;
        private String gcpInstanceId;
        private String projectId;
        private String zone;
        private String machineType;
        private Integer vcpu;
        private BigDecimal ramGb;
        private Integer bootDiskSizeGb;
        private String bootDiskType;
        private String bootImage;
        private String vpcNetwork;
        private String subnet;
        private String internalIp;
        private String externalIp;
        private CloudVmStatus status;
        private OffsetDateTime lastSyncAt;
        private BigDecimal estimatedHourlyCost;
        private BigDecimal estimatedMonthlyCost;
        private String costAssumptions;
        private String createdBy;
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CloudOperationDto {
        private Long id;
        private String operationId;
        private String operationType;
        private String targetResource;
        private String zone;
        private String projectId;
        private String status;
        private Integer httpStatusCode;
        private String errorMessage;
        private String initiatedBy;
        private OffsetDateTime createdAt;
        private OffsetDateTime completedAt;
    }
}
