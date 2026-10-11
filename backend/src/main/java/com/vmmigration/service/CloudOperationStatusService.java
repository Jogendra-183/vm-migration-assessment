package com.vmmigration.service;

import com.google.cloud.compute.v1.Instance;
import com.google.cloud.compute.v1.NetworkInterface;
import com.google.cloud.compute.v1.Operation;
import com.vmmigration.dto.CloudDtos.CloudOperationDto;
import com.vmmigration.dto.CloudDtos.CloudVmDto;
import com.vmmigration.entity.*;
import com.vmmigration.exception.ResourceNotFoundException;
import com.vmmigration.repository.CloudOperationRepository;
import com.vmmigration.repository.CloudVmRepository;
import com.vmmigration.repository.ProvisioningRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudOperationStatusService {

    private final CloudOperationRepository cloudOperationRepository;
    private final ProvisioningRequestRepository provisioningRequestRepository;
    private final CloudVmRepository cloudVmRepository;
    private final ComputeEngineService computeEngineService;

    @Async
    public void trackOperationAsync(String operationId, String zone, Long requestId, Long vmId) {
        log.info("Starting background tracking for operation: {} (requestId: {}, vmId: {})", operationId, requestId, vmId);
        int maxAttempts = 30; // 30 * 2 seconds = 60 seconds max
        int attempt = 0;

        while (attempt < maxAttempts) {
            try {
                Thread.sleep(2000); // 2 second poll interval
                attempt++;

                Optional<Operation> opOpt = computeEngineService.getZoneOperation(operationId, zone);
                if (opOpt.isEmpty()) {
                    continue;
                }

                Operation op = opOpt.get();
                if (op.getStatus() == Operation.Status.DONE) {
                    log.info("Operation {} completed with status DONE", operationId);
                    completeOperation(operationId, zone, requestId, vmId, op);
                    return;
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.warn("Tracking interrupted for operation {}", operationId);
                return;
            } catch (Exception e) {
                log.warn("Error during operation polling attempt {}: {}", attempt, e.getMessage());
            }
        }

        // Check instance directly after polling timeout
        checkInstanceFallback(zone, requestId, vmId);
    }

    @Transactional
    public void completeOperation(String operationId, String zone, Long requestId, Long vmId, Operation op) {
        CloudOperation cloudOp = cloudOperationRepository.findByOperationId(operationId)
                .orElse(null);

        boolean hasError = op.hasError();
        String errorMsg = hasError ? op.getError().getErrors(0).getMessage() : null;

        if (cloudOp != null) {
            cloudOp.setStatus(hasError ? "FAILED" : "DONE");
            cloudOp.setHttpStatusCode(op.getHttpErrorStatusCode());
            cloudOp.setErrorMessage(errorMsg);
            cloudOp.setCompletedAt(OffsetDateTime.now());
            cloudOperationRepository.save(cloudOp);
        }

        ProvisioningRequest req = requestId != null ? provisioningRequestRepository.findById(requestId).orElse(null) : null;
        CloudVm vm = vmId != null ? cloudVmRepository.findById(vmId).orElse(null) : null;

        if (hasError) {
            if (req != null) {
                req.setStatus(ProvisioningStatus.FAILED);
                req.setErrorMessage(errorMsg);
                provisioningRequestRepository.save(req);
            }
            if (vm != null) {
                vm.setStatus(CloudVmStatus.FAILED);
                vm.setCostAssumptions("Creation failed on Google Cloud: " + errorMsg);
                cloudVmRepository.save(vm);
            }
        } else {
            if (req != null) {
                req.setStatus(ProvisioningStatus.COMPLETED);
                provisioningRequestRepository.save(req);
            }
            if (vm != null) {
                // Fetch actual verified instance attributes from Compute Engine
                syncVmInstanceAttributes(vm);
            }
        }
    }

    @Transactional
    public void checkInstanceFallback(String zone, Long requestId, Long vmId) {
        if (vmId == null) return;
        cloudVmRepository.findById(vmId).ifPresent(this::syncVmInstanceAttributes);
    }

    @Transactional
    public CloudVm syncVmState(Long vmId) {
        CloudVm vm = cloudVmRepository.findById(vmId)
                .orElseThrow(() -> new ResourceNotFoundException("CloudVm not found with id: " + vmId));
        syncVmInstanceAttributes(vm);
        return vm;
    }

    private void syncVmInstanceAttributes(CloudVm vm) {
        Optional<Instance> instanceOpt = computeEngineService.getInstance(vm.getInstanceName(), vm.getZone());
        if (instanceOpt.isPresent()) {
            Instance inst = instanceOpt.get();
            vm.setGcpInstanceId(String.valueOf(inst.getId()));

            String gcpStatus = inst.getStatus();
            if ("RUNNING".equalsIgnoreCase(gcpStatus)) {
                vm.setStatus(CloudVmStatus.RUNNING);
            } else if ("TERMINATED".equalsIgnoreCase(gcpStatus) || "STOPPED".equalsIgnoreCase(gcpStatus)) {
                vm.setStatus(CloudVmStatus.STOPPED);
            } else if ("STAGING".equalsIgnoreCase(gcpStatus) || "PROVISIONING".equalsIgnoreCase(gcpStatus)) {
                vm.setStatus(CloudVmStatus.PROVISIONING);
            } else if ("STOPPING".equalsIgnoreCase(gcpStatus)) {
                vm.setStatus(CloudVmStatus.STOPPING);
            }

            // Extract network IPs
            if (inst.getNetworkInterfacesCount() > 0) {
                NetworkInterface iface = inst.getNetworkInterfaces(0);
                vm.setInternalIp(iface.getNetworkIP());
                if (iface.getAccessConfigsCount() > 0) {
                    vm.setExternalIp(iface.getAccessConfigs(0).getNatIP());
                }
            }
        }
        vm.setLastSyncAt(OffsetDateTime.now());
        cloudVmRepository.save(vm);
    }

    @Transactional(readOnly = true)
    public CloudOperationDto getOperation(String operationId) {
        return cloudOperationRepository.findByOperationId(operationId)
                .map(this::mapOpToDto)
                .orElseThrow(() -> new ResourceNotFoundException("CloudOperation not found with operationId: " + operationId));
    }

    @Transactional(readOnly = true)
    public List<CloudOperationDto> listRecentOperations() {
        return cloudOperationRepository.findAllByOrderByCreatedAtDesc().stream()
                .limit(20)
                .map(this::mapOpToDto)
                .collect(Collectors.toList());
    }

    private CloudOperationDto mapOpToDto(CloudOperation op) {
        return CloudOperationDto.builder()
                .id(op.getId())
                .operationId(op.getOperationId())
                .operationType(op.getOperationType())
                .targetResource(op.getTargetResource())
                .zone(op.getZone())
                .projectId(op.getProjectId())
                .status(op.getStatus())
                .httpStatusCode(op.getHttpStatusCode())
                .errorMessage(op.getErrorMessage())
                .initiatedBy(op.getInitiatedBy())
                .createdAt(op.getCreatedAt())
                .completedAt(op.getCompletedAt())
                .build();
    }
}
