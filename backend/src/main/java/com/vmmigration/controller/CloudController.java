package com.vmmigration.controller;

import com.vmmigration.dto.CloudDtos.*;
import com.vmmigration.repository.CloudVmRepository;
import com.vmmigration.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cloud")
@RequiredArgsConstructor
@Tag(name = "Google Cloud Integration", description = "Endpoints for Google Cloud Compute Engine provisioning and VM lifecycle management")
public class CloudController {

    private final ComputeEngineService computeEngineService;
    private final CloudPricingService cloudPricingService;
    private final VmProvisioningService vmProvisioningService;
    private final CloudVmManagementService cloudVmManagementService;
    private final CloudOperationStatusService operationStatusService;
    private final CloudVmRepository cloudVmRepository;

    @GetMapping("/health")
    @Operation(summary = "Check Google Cloud connection status", description = "Safe read-only call to verify ADC credentials and project connectivity")
    public ResponseEntity<CloudHealthDto> checkHealth() {
        Map<String, Object> health = computeEngineService.checkHealth();
        boolean connected = Boolean.TRUE.equals(health.get("connected"));
        boolean apiEnabled = Boolean.TRUE.equals(health.get("apiEnabled"));
        boolean mockMode = Boolean.TRUE.equals(health.get("mockMode"));
        String projectId = (String) health.get("projectId");
        String account = (String) health.get("account");
        String defaultRegion = (String) health.get("defaultRegion");
        String defaultZone = (String) health.get("defaultZone");
        String message = (String) health.get("message");
        long activeVms = cloudVmRepository.count();

        CloudHealthDto dto = CloudHealthDto.builder()
                .connected(connected)
                .projectId(projectId)
                .authenticatedAccount(account != null ? account : "Application Default Credentials")
                .defaultRegion(defaultRegion)
                .defaultZone(defaultZone)
                .apiEnabled(apiEnabled)
                .mockMode(mockMode)
                .activeVmCount(activeVms)
                .message(message)
                .build();

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/zones")
    @Operation(summary = "List available zones in target region")
    public ResponseEntity<List<String>> listZones() {
        return ResponseEntity.ok(computeEngineService.listZones());
    }

    @GetMapping("/machine-types")
    @Operation(summary = "List supported Google Cloud machine types and price estimates")
    public ResponseEntity<List<MachineTypeOptionDto>> listMachineTypes() {
        return ResponseEntity.ok(cloudPricingService.getAvailableMachineTypes());
    }

    @PostMapping("/provisioning/preview")
    @Operation(summary = "Generate non-billable provisioning preview for a source server")
    public ResponseEntity<ProvisioningPreviewResponse> generatePreview(@Valid @RequestBody ProvisioningPreviewRequest request) {
        return ResponseEntity.ok(vmProvisioningService.generatePreview(request));
    }

    @GetMapping("/provisioning/requests")
    @Operation(summary = "List all cloud VM provisioning requests")
    public ResponseEntity<List<ProvisioningRequestDto>> listProvisioningRequests() {
        return ResponseEntity.ok(vmProvisioningService.listRequests());
    }

    @GetMapping("/provisioning/requests/{id}")
    @Operation(summary = "Get provisioning request details by ID")
    public ResponseEntity<ProvisioningRequestDto> getProvisioningRequest(@PathVariable Long id) {
        return ResponseEntity.ok(vmProvisioningService.getRequest(id));
    }

    @PostMapping("/provisioning/requests")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new pending VM provisioning request")
    public ResponseEntity<ProvisioningRequestDto> createProvisioningRequest(
            @Valid @RequestBody CreateProvisioningRequestDto dto,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "admin";
        ProvisioningRequestDto created = vmProvisioningService.createProvisioningRequest(dto, username);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PostMapping("/provisioning/requests/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approve or reject a pending provisioning request")
    public ResponseEntity<ProvisioningRequestDto> approveProvisioningRequest(
            @PathVariable Long id,
            @Valid @RequestBody ApproveProvisioningRequestDto dto,
            Authentication authentication) {
        String adminUsername = authentication != null ? authentication.getName() : "admin";
        return ResponseEntity.ok(vmProvisioningService.approveRequest(id, dto, adminUsername));
    }

    @PostMapping("/provisioning/requests/{id}/execute")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Execute an approved VM provisioning request on Google Cloud")
    public ResponseEntity<ProvisioningRequestDto> executeProvisioningRequest(
            @PathVariable Long id,
            Authentication authentication) {
        String adminUsername = authentication != null ? authentication.getName() : "admin";
        return ResponseEntity.ok(vmProvisioningService.executeProvisioning(id, adminUsername));
    }

    @GetMapping("/vms")
    @Operation(summary = "List application-managed cloud VMs")
    public ResponseEntity<List<CloudVmDto>> listCloudVms() {
        return ResponseEntity.ok(cloudVmManagementService.listVms());
    }

    @GetMapping("/vms/{id}")
    @Operation(summary = "Get details of an application-managed cloud VM")
    public ResponseEntity<CloudVmDto> getCloudVm(@PathVariable Long id) {
        return ResponseEntity.ok(cloudVmManagementService.getVm(id));
    }

    @PostMapping("/vms/{id}/start")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Start a stopped cloud VM instance")
    public ResponseEntity<CloudVmDto> startCloudVm(@PathVariable Long id, Authentication authentication) {
        String adminUsername = authentication != null ? authentication.getName() : "admin";
        return ResponseEntity.ok(cloudVmManagementService.startVm(id, adminUsername));
    }

    @PostMapping("/vms/{id}/stop")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Stop a running cloud VM instance to minimize charges")
    public ResponseEntity<CloudVmDto> stopCloudVm(@PathVariable Long id, Authentication authentication) {
        String adminUsername = authentication != null ? authentication.getName() : "admin";
        return ResponseEntity.ok(cloudVmManagementService.stopVm(id, adminUsername));
    }

    @PostMapping("/vms/{id}/sync")
    @Operation(summary = "Synchronize VM state directly from Google Cloud Compute Engine")
    public ResponseEntity<CloudVmDto> syncCloudVm(@PathVariable Long id) {
        return ResponseEntity.ok(cloudVmManagementService.getVm(id));
    }

    @DeleteMapping("/vms/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Terminate and clean up a test cloud VM instance")
    public ResponseEntity<CloudVmDto> deleteCloudVm(@PathVariable Long id, Authentication authentication) {
        String adminUsername = authentication != null ? authentication.getName() : "admin";
        return ResponseEntity.ok(cloudVmManagementService.deleteVm(id, adminUsername));
    }

    @GetMapping("/operations/{id}")
    @Operation(summary = "Track status of an asynchronous cloud operation")
    public ResponseEntity<CloudOperationDto> getOperation(@PathVariable String id) {
        return ResponseEntity.ok(operationStatusService.getOperation(id));
    }

    @GetMapping("/operations")
    @Operation(summary = "List recent cloud operations log")
    public ResponseEntity<List<CloudOperationDto>> listOperations() {
        return ResponseEntity.ok(operationStatusService.listRecentOperations());
    }
}
