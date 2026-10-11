package com.vmmigration.service;

import com.vmmigration.config.GoogleCloudProperties;
import com.vmmigration.entity.*;
import com.vmmigration.exception.BadRequestException;
import com.vmmigration.repository.CloudVmRepository;
import com.vmmigration.repository.ProvisioningRequestRepository;
import com.vmmigration.repository.ServerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CloudResourceValidationService {

    private final GoogleCloudProperties gcpProperties;
    private final ServerRepository serverRepository;
    private final CloudVmRepository cloudVmRepository;
    private final ProvisioningRequestRepository provisioningRequestRepository;

    public static class ValidationResult {
        public final boolean eligible;
        public final List<String> warnings;
        public final List<String> blockingErrors;

        public ValidationResult(boolean eligible, List<String> warnings, List<String> blockingErrors) {
            this.eligible = eligible;
            this.warnings = warnings;
            this.blockingErrors = blockingErrors;
        }
    }

    public ValidationResult validateServerEligibility(Server server) {
        List<String> warnings = new ArrayList<>();
        List<String> blockingErrors = new ArrayList<>();

        // 1. Check Classification
        Assessment assessment = server.getAssessment();
        Classification classification = assessment != null ? assessment.getClassification() : Classification.READY_TO_MIGRATE;

        if (classification == Classification.RETIRE) {
            blockingErrors.add("Server is classified as RETIRE. Obsolete workload marked for decommissioning, not cloud migration.");
        } else if (classification == Classification.KEEP_PHYSICAL) {
            blockingErrors.add("Server is classified as KEEP_PHYSICAL due to hardware lock-in or virtualization incompatibility.");
        } else if (classification == Classification.REQUIRES_OPTIMIZATION) {
            warnings.add("Server is classified as REQUIRES_OPTIMIZATION. Workload should be right-sized and memory-tuned before final migration cutover.");
        }

        // 2. Check Hardware Dependencies
        if (Boolean.TRUE.equals(server.getHardwareDependency())) {
            blockingErrors.add("Server has physical hardware dependencies (custom PCIe controller, dongle, or dedicated SAN).");
        }

        // 3. Check Virtualization Compatibility
        if (Boolean.FALSE.equals(server.getVirtualizationCompatibility())) {
            blockingErrors.add("Server is flagged incompatible with hypervisors and cloud virtual machines.");
        }

        // 4. Check Risk Level
        if (assessment != null && assessment.getRiskLevel() == RiskLevel.CRITICAL) {
            warnings.add("CRITICAL Risk profile: Workload has mission-critical SLA or heavy multi-tier dependencies. Ensure pilot validation before cutover.");
        }

        // 5. Check if already active/provisioning
        boolean activeRequest = provisioningRequestRepository.existsBySourceServerIdAndStatusIn(
                server.getId(),
                Arrays.asList(ProvisioningStatus.PENDING_APPROVAL, ProvisioningStatus.APPROVED, ProvisioningStatus.CREATING)
        );
        if (activeRequest) {
            blockingErrors.add("An active provisioning request already exists for this source server.");
        }

        cloudVmRepository.findBySourceServerId(server.getId()).ifPresent(vm -> {
            if (vm.getStatus() == CloudVmStatus.RUNNING || vm.getStatus() == CloudVmStatus.PROVISIONING) {
                blockingErrors.add(String.format("A cloud VM '%s' is already active (%s) for this source server.", vm.getInstanceName(), vm.getStatus()));
            }
        });

        // 6. Check Safety Limits (Free Trial Safeguard)
        long activeCount = cloudVmRepository.countByStatus(CloudVmStatus.RUNNING) + cloudVmRepository.countByStatus(CloudVmStatus.PROVISIONING);
        if (activeCount >= gcpProperties.getMaxConcurrentVms()) {
            blockingErrors.add(String.format("Free trial safeguard limit reached: %d active cloud VMs are already running. Stop or terminate existing VMs before provisioning new instances.", activeCount));
        }

        boolean eligible = blockingErrors.isEmpty();
        return new ValidationResult(eligible, warnings, blockingErrors);
    }

    public void validateMachineType(String machineType) {
        if (!gcpProperties.getCostControl().isEnforceSafetyLimits()) {
            return;
        }

        List<String> allowed = gcpProperties.getCostControl().getAllowedMachineTypes();
        if (!allowed.contains(machineType.toLowerCase())) {
            throw new BadRequestException(String.format(
                    "Machine type '%s' is not in the approved Free Trial safety list (%s). Choose an allowed machine type to avoid unexpected billing.",
                    machineType, String.join(", ", allowed)
            ));
        }
    }
}
