package com.vmmigration.service;

import com.google.cloud.compute.v1.Operation;
import com.vmmigration.dto.CloudDtos.CloudVmDto;
import com.vmmigration.entity.CloudOperation;
import com.vmmigration.entity.CloudVm;
import com.vmmigration.entity.CloudVmStatus;
import com.vmmigration.exception.BadRequestException;
import com.vmmigration.exception.ResourceNotFoundException;
import com.vmmigration.repository.CloudOperationRepository;
import com.vmmigration.repository.CloudVmRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudVmManagementService {

    private final CloudVmRepository cloudVmRepository;
    private final CloudOperationRepository cloudOperationRepository;
    private final ComputeEngineService computeEngineService;
    private final CloudOperationStatusService operationStatusService;

    @Transactional(readOnly = true)
    public List<CloudVmDto> listVms() {
        return cloudVmRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CloudVmDto getVm(Long id) {
        CloudVm vm = cloudVmRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CloudVm not found with id: " + id));
        // Auto sync if status is not TERMINATED
        if (vm.getStatus() != CloudVmStatus.TERMINATED && vm.getStatus() != CloudVmStatus.FAILED) {
            vm = operationStatusService.syncVmState(id);
        }
        return mapToDto(vm);
    }

    @Transactional
    public CloudVmDto startVm(Long id, String adminUsername) {
        CloudVm vm = cloudVmRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CloudVm not found with id: " + id));

        if (vm.getStatus() == CloudVmStatus.RUNNING) {
            throw new BadRequestException("Virtual machine is already running.");
        }
        if (vm.getStatus() == CloudVmStatus.TERMINATED) {
            throw new BadRequestException("Terminated VMs cannot be restarted.");
        }

        try {
            Operation op = computeEngineService.startInstance(vm.getInstanceName(), vm.getZone());
            vm.setStatus(CloudVmStatus.PROVISIONING);
            vm.setLastSyncAt(OffsetDateTime.now());
            cloudVmRepository.save(vm);

            CloudOperation cloudOp = CloudOperation.builder()
                    .operationId(op.getName())
                    .operationType("START")
                    .targetResource(vm.getInstanceName())
                    .zone(vm.getZone())
                    .projectId(vm.getProjectId())
                    .status(op.getStatus().name())
                    .initiatedBy(adminUsername)
                    .build();
            cloudOperationRepository.save(cloudOp);

            operationStatusService.trackOperationAsync(op.getName(), vm.getZone(), null, vm.getId());

            return mapToDto(vm);
        } catch (IOException e) {
            log.error("Failed to start VM {}: {}", vm.getInstanceName(), e.getMessage());
            throw new BadRequestException("Failed to start VM on Google Cloud: " + e.getMessage());
        }
    }

    @Transactional
    public CloudVmDto stopVm(Long id, String adminUsername) {
        CloudVm vm = cloudVmRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CloudVm not found with id: " + id));

        if (vm.getStatus() == CloudVmStatus.STOPPED) {
            throw new BadRequestException("Virtual machine is already stopped.");
        }
        if (vm.getStatus() == CloudVmStatus.TERMINATED) {
            throw new BadRequestException("Cannot stop a terminated VM.");
        }

        try {
            Operation op = computeEngineService.stopInstance(vm.getInstanceName(), vm.getZone());
            vm.setStatus(CloudVmStatus.STOPPING);
            vm.setLastSyncAt(OffsetDateTime.now());
            cloudVmRepository.save(vm);

            CloudOperation cloudOp = CloudOperation.builder()
                    .operationId(op.getName())
                    .operationType("STOP")
                    .targetResource(vm.getInstanceName())
                    .zone(vm.getZone())
                    .projectId(vm.getProjectId())
                    .status(op.getStatus().name())
                    .initiatedBy(adminUsername)
                    .build();
            cloudOperationRepository.save(cloudOp);

            operationStatusService.trackOperationAsync(op.getName(), vm.getZone(), null, vm.getId());

            return mapToDto(vm);
        } catch (IOException e) {
            log.error("Failed to stop VM {}: {}", vm.getInstanceName(), e.getMessage());
            throw new BadRequestException("Failed to stop VM on Google Cloud: " + e.getMessage());
        }
    }

    @Transactional
    public CloudVmDto deleteVm(Long id, String adminUsername) {
        CloudVm vm = cloudVmRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CloudVm not found with id: " + id));

        if (vm.getStatus() == CloudVmStatus.TERMINATED) {
            throw new BadRequestException("Virtual machine is already terminated.");
        }

        try {
            Operation op = computeEngineService.deleteInstance(vm.getInstanceName(), vm.getZone());
            vm.setStatus(CloudVmStatus.TERMINATING);
            vm.setLastSyncAt(OffsetDateTime.now());
            cloudVmRepository.save(vm);

            CloudOperation cloudOp = CloudOperation.builder()
                    .operationId(op.getName())
                    .operationType("DELETE")
                    .targetResource(vm.getInstanceName())
                    .zone(vm.getZone())
                    .projectId(vm.getProjectId())
                    .status(op.getStatus().name())
                    .initiatedBy(adminUsername)
                    .build();
            cloudOperationRepository.save(cloudOp);

            operationStatusService.trackOperationAsync(op.getName(), vm.getZone(), null, vm.getId());

            return mapToDto(vm);
        } catch (IOException e) {
            log.error("Failed to delete VM {}: {}", vm.getInstanceName(), e.getMessage());
            throw new BadRequestException("Failed to delete VM on Google Cloud: " + e.getMessage());
        }
    }

    public CloudVmDto mapToDto(CloudVm vm) {
        return CloudVmDto.builder()
                .id(vm.getId())
                .sourceServerId(vm.getSourceServer() != null ? vm.getSourceServer().getId() : null)
                .sourceServerName(vm.getSourceServer() != null ? vm.getSourceServer().getServerName() : null)
                .instanceName(vm.getInstanceName())
                .gcpInstanceId(vm.getGcpInstanceId())
                .projectId(vm.getProjectId())
                .zone(vm.getZone())
                .machineType(vm.getMachineType())
                .vcpu(vm.getVcpu())
                .ramGb(vm.getRamGb())
                .bootDiskSizeGb(vm.getBootDiskSizeGb())
                .bootDiskType(vm.getBootDiskType())
                .bootImage(vm.getBootImage())
                .vpcNetwork(vm.getVpcNetwork())
                .subnet(vm.getSubnet())
                .internalIp(vm.getInternalIp())
                .externalIp(vm.getExternalIp())
                .status(vm.getStatus())
                .lastSyncAt(vm.getLastSyncAt())
                .estimatedHourlyCost(vm.getEstimatedHourlyCost())
                .estimatedMonthlyCost(vm.getEstimatedMonthlyCost())
                .costAssumptions(vm.getCostAssumptions())
                .createdBy(vm.getCreatedBy())
                .createdAt(vm.getCreatedAt())
                .updatedAt(vm.getUpdatedAt())
                .build();
    }
}
