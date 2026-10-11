package com.vmmigration.service;

import com.google.cloud.compute.v1.Operation;
import com.vmmigration.config.GoogleCloudProperties;
import com.vmmigration.dto.CloudDtos.*;
import com.vmmigration.entity.*;
import com.vmmigration.exception.BadRequestException;
import com.vmmigration.exception.ResourceNotFoundException;
import com.vmmigration.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VmProvisioningService {

    private final GoogleCloudProperties gcpProperties;
    private final ServerRepository serverRepository;
    private final AssessmentRepository assessmentRepository;
    private final VmRecommendationRepository vmRecommendationRepository;
    private final ProvisioningRequestRepository provisioningRequestRepository;
    private final CloudVmRepository cloudVmRepository;
    private final CloudOperationRepository cloudOperationRepository;
    private final CloudResourceValidationService validationService;
    private final CloudPricingService pricingService;
    private final ComputeEngineService computeEngineService;
    private final CloudOperationStatusService operationStatusService;

    @Transactional(readOnly = true)
    public ProvisioningPreviewResponse generatePreview(ProvisioningPreviewRequest request) {
        Server server = serverRepository.findById(request.getServerId())
                .orElseThrow(() -> new ResourceNotFoundException("Server not found with id: " + request.getServerId()));

        Assessment assessment = server.getAssessment();
        VmRecommendation recommendation = server.getVmRecommendation();

        CloudResourceValidationService.ValidationResult validationResult = validationService.validateServerEligibility(server);

        int targetVcpu = recommendation != null ? recommendation.getRecommendedVcpu() : Math.max(1, server.getCpuCores() / 2);
        int targetRamGb = recommendation != null ? recommendation.getRecommendedRamGb() : Math.max(2, server.getTotalRamGb() / 2);

        String machineType = (request.getOverrideMachineType() != null && !request.getOverrideMachineType().isBlank())
                ? request.getOverrideMachineType().trim()
                : pricingService.recommendMachineType(targetVcpu, targetRamGb);

        // Validate allowed machine type
        validationService.validateMachineType(machineType);

        int diskSizeGb = (request.getBootDiskSizeGb() != null && request.getBootDiskSizeGb() > 0)
                ? request.getBootDiskSizeGb()
                : (recommendation != null ? recommendation.getRecommendedStorageGb() : Math.max(50, server.getTotalStorageGb()));

        // Free tier safeguard: clamp disk size to reasonable max in test mode
        if (diskSizeGb > 200 && gcpProperties.getCostControl().isEnforceSafetyLimits()) {
            diskSizeGb = 100; // sensible capped test disk
        }

        String zone = (request.getPreferredZone() != null && !request.getPreferredZone().isBlank())
                ? request.getPreferredZone().trim()
                : gcpProperties.getDefaultZone();

        CloudPricingService.CostEstimate estimate = pricingService.calculateEstimate(machineType, diskSizeGb);

        String trialNotice = "Trial credits (₹28,797) will offset eligible compute runtime. Remember: Persistent Disks remain billable even when a VM is stopped until the disk/VM is terminated.";

        List<String> warnings = new ArrayList<>(validationResult.warnings);
        if (!validationResult.blockingErrors.isEmpty()) {
            warnings.addAll(validationResult.blockingErrors);
        }

        return ProvisioningPreviewResponse.builder()
                .serverId(server.getId())
                .serverName(server.getServerName())
                .sourceOs(server.getOperatingSystem() + " " + server.getOsVersion())
                .sourceCores(server.getCpuCores())
                .sourceRamGb(server.getTotalRamGb())
                .sourceStorageGb(server.getTotalStorageGb())
                .migrationScore(assessment != null ? assessment.getMigrationScore() : BigDecimal.ZERO)
                .classification(assessment != null ? assessment.getClassification() : Classification.READY_TO_MIGRATE)
                .riskLevel(assessment != null ? assessment.getRiskLevel() : RiskLevel.LOW)
                .eligibleForProvisioning(validationResult.eligible)
                .warnings(warnings)
                .recommendedMachineType(machineType)
                .recommendedVcpu(targetVcpu)
                .recommendedRamGb(BigDecimal.valueOf(targetRamGb))
                .recommendedDiskGb(diskSizeGb)
                .recommendedDiskType("pd-standard")
                .bootImage("projects/debian-cloud/global/images/family/debian-12")
                .zone(zone)
                .network(gcpProperties.getDefaultNetwork())
                .estimatedHourlyCostUsd(estimate.hourlyUsd)
                .estimatedMonthlyCostUsd(estimate.monthlyUsd)
                .estimatedMonthlyCostInr(estimate.monthlyInr)
                .costAssumptions(estimate.assumptions)
                .trialCreditsNotice(trialNotice)
                .build();
    }

    @Transactional
    public ProvisioningRequestDto createProvisioningRequest(CreateProvisioningRequestDto dto, String requestedBy) {
        Server server = serverRepository.findById(dto.getServerId())
                .orElseThrow(() -> new ResourceNotFoundException("Server not found with id: " + dto.getServerId()));

        CloudResourceValidationService.ValidationResult validationResult = validationService.validateServerEligibility(server);
        if (!validationResult.eligible) {
            throw new BadRequestException("Server is not eligible for cloud provisioning: " + String.join("; ", validationResult.blockingErrors));
        }

        Assessment assessment = server.getAssessment();
        VmRecommendation recommendation = server.getVmRecommendation();

        int targetVcpu = recommendation != null ? recommendation.getRecommendedVcpu() : Math.max(1, server.getCpuCores() / 2);
        int targetRamGb = recommendation != null ? recommendation.getRecommendedRamGb() : Math.max(2, server.getTotalRamGb() / 2);

        String machineType = (dto.getMachineType() != null && !dto.getMachineType().isBlank())
                ? dto.getMachineType().trim()
                : pricingService.recommendMachineType(targetVcpu, targetRamGb);

        validationService.validateMachineType(machineType);

        String zone = (dto.getZone() != null && !dto.getZone().isBlank())
                ? dto.getZone().trim()
                : gcpProperties.getDefaultZone();

        int diskSize = (dto.getBootDiskSizeGb() != null && dto.getBootDiskSizeGb() > 0)
                ? dto.getBootDiskSizeGb()
                : (recommendation != null ? recommendation.getRecommendedStorageGb() : 50);

        if (diskSize > 200 && gcpProperties.getCostControl().isEnforceSafetyLimits()) {
            diskSize = 100;
        }

        // Clean RFC 1035 instance name
        String instanceName = dto.getInstanceName();
        if (instanceName == null || instanceName.isBlank()) {
            String cleanServer = server.getServerName().toLowerCase().replaceAll("[^a-z0-9-]", "-");
            if (cleanServer.length() > 30) cleanServer = cleanServer.substring(0, 30);
            instanceName = "vm-" + cleanServer + "-" + UUID.randomUUID().toString().substring(0, 6);
        } else {
            instanceName = instanceName.toLowerCase().replaceAll("[^a-z0-9-]", "-");
        }

        CloudPricingService.CostEstimate estimate = pricingService.calculateEstimate(machineType, diskSize);

        ProvisioningRequest req = ProvisioningRequest.builder()
                .sourceServer(server)
                .assessment(assessment)
                .recommendation(recommendation)
                .instanceName(instanceName)
                .projectId(gcpProperties.getProjectId())
                .zone(zone)
                .machineType(machineType)
                .vcpu(targetVcpu)
                .ramGb(BigDecimal.valueOf(targetRamGb))
                .bootDiskSizeGb(diskSize)
                .bootDiskType("pd-standard")
                .bootImage(dto.getBootImage() != null && !dto.getBootImage().isBlank() ? dto.getBootImage() : "projects/debian-cloud/global/images/family/debian-12")
                .vpcNetwork(gcpProperties.getDefaultNetwork())
                .status(ProvisioningStatus.PENDING_APPROVAL)
                .requestedBy(requestedBy != null ? requestedBy : "admin")
                .estimatedMonthlyCost(estimate.monthlyInr)
                .build();

        ProvisioningRequest saved = provisioningRequestRepository.save(req);
        return mapToDto(saved);
    }

    @Transactional
    public ProvisioningRequestDto approveRequest(Long requestId, ApproveProvisioningRequestDto dto, String adminUsername) {
        ProvisioningRequest req = provisioningRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("ProvisioningRequest not found with id: " + requestId));

        if (req.getStatus() != ProvisioningStatus.PENDING_APPROVAL) {
            throw new BadRequestException("Only requests in PENDING_APPROVAL status can be reviewed. Current status: " + req.getStatus());
        }

        if (Boolean.TRUE.equals(dto.getApproved())) {
            req.setStatus(ProvisioningStatus.APPROVED);
        } else {
            req.setStatus(ProvisioningStatus.REJECTED);
        }

        req.setApprovedBy(adminUsername);
        req.setApprovalComment(dto.getComment());
        req.setApprovedAt(OffsetDateTime.now());

        ProvisioningRequest updated = provisioningRequestRepository.save(req);
        return mapToDto(updated);
    }

    @Transactional
    public ProvisioningRequestDto executeProvisioning(Long requestId, String adminUsername) {
        ProvisioningRequest req = provisioningRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("ProvisioningRequest not found with id: " + requestId));

        if (req.getStatus() != ProvisioningStatus.APPROVED) {
            throw new BadRequestException("Request must be in APPROVED state prior to cloud execution. Current state: " + req.getStatus());
        }

        // Check if VM name already exists in database
        if (cloudVmRepository.existsByInstanceName(req.getInstanceName())) {
            throw new BadRequestException("A cloud VM with instance name '" + req.getInstanceName() + "' already exists.");
        }

        try {
            req.setStatus(ProvisioningStatus.CREATING);
            provisioningRequestRepository.saveAndFlush(req);

            // Call Compute Engine API
            Operation operation = computeEngineService.createInstance(
                    req.getInstanceName(),
                    req.getZone(),
                    req.getMachineType(),
                    req.getBootDiskSizeGb(),
                    req.getBootImage(),
                    req.getVpcNetwork()
            );

            String operationId = operation.getName();
            req.setOperationId(operationId);

            // Record Cloud Operation
            CloudOperation cloudOp = CloudOperation.builder()
                    .operationId(operationId)
                    .operationType("INSERT")
                    .targetResource(req.getInstanceName())
                    .zone(req.getZone())
                    .projectId(req.getProjectId())
                    .status(operation.getStatus().name())
                    .initiatedBy(adminUsername)
                    .build();
            cloudOperationRepository.save(cloudOp);

            // Record Initial Cloud VM
            CloudPricingService.CostEstimate estimate = pricingService.calculateEstimate(req.getMachineType(), req.getBootDiskSizeGb());
            CloudVm vm = CloudVm.builder()
                    .sourceServer(req.getSourceServer())
                    .instanceName(req.getInstanceName())
                    .projectId(req.getProjectId())
                    .zone(req.getZone())
                    .machineType(req.getMachineType())
                    .vcpu(req.getVcpu())
                    .ramGb(req.getRamGb())
                    .bootDiskSizeGb(req.getBootDiskSizeGb())
                    .bootDiskType(req.getBootDiskType())
                    .bootImage(req.getBootImage())
                    .vpcNetwork(req.getVpcNetwork())
                    .status(CloudVmStatus.PROVISIONING)
                    .estimatedHourlyCost(estimate.hourlyUsd)
                    .estimatedMonthlyCost(estimate.monthlyInr)
                    .costAssumptions(estimate.assumptions)
                    .createdBy(adminUsername)
                    .lastSyncAt(OffsetDateTime.now())
                    .build();
            cloudVmRepository.save(vm);

            ProvisioningRequest saved = provisioningRequestRepository.save(req);

            // Trigger asynchronous tracking
            operationStatusService.trackOperationAsync(operationId, req.getZone(), req.getId(), vm.getId());

            return mapToDto(saved);
        } catch (Exception e) {
            log.error("Failed to provision instance on Google Cloud Compute Engine: {}", e.getMessage(), e);
            req.setStatus(ProvisioningStatus.FAILED);
            req.setErrorMessage(e.getMessage());
            provisioningRequestRepository.save(req);
            throw new BadRequestException("Google Cloud Compute Engine provisioning failed: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<ProvisioningRequestDto> listRequests() {
        return provisioningRequestRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProvisioningRequestDto getRequest(Long id) {
        return provisioningRequestRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new ResourceNotFoundException("ProvisioningRequest not found with id: " + id));
    }

    private ProvisioningRequestDto mapToDto(ProvisioningRequest req) {
        return ProvisioningRequestDto.builder()
                .id(req.getId())
                .sourceServerId(req.getSourceServer() != null ? req.getSourceServer().getId() : null)
                .sourceServerName(req.getSourceServer() != null ? req.getSourceServer().getServerName() : null)
                .instanceName(req.getInstanceName())
                .projectId(req.getProjectId())
                .zone(req.getZone())
                .machineType(req.getMachineType())
                .vcpu(req.getVcpu())
                .ramGb(req.getRamGb())
                .bootDiskSizeGb(req.getBootDiskSizeGb())
                .bootDiskType(req.getBootDiskType())
                .bootImage(req.getBootImage())
                .vpcNetwork(req.getVpcNetwork())
                .status(req.getStatus())
                .requestedBy(req.getRequestedBy())
                .approvedBy(req.getApprovedBy())
                .approvalComment(req.getApprovalComment())
                .approvedAt(req.getApprovedAt())
                .operationId(req.getOperationId())
                .errorMessage(req.getErrorMessage())
                .estimatedMonthlyCost(req.getEstimatedMonthlyCost())
                .createdAt(req.getCreatedAt())
                .updatedAt(req.getUpdatedAt())
                .build();
    }
}
