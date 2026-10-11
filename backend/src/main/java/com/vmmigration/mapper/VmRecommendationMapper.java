package com.vmmigration.mapper;

import com.vmmigration.dto.VmDtos;
import com.vmmigration.entity.VmRecommendation;
import org.springframework.stereotype.Component;

@Component
public class VmRecommendationMapper {

    public VmDtos.VmRecommendationDto toDto(VmRecommendation vm) {
        if (vm == null) {
            return null;
        }

        int currentCores = vm.getServer() != null ? vm.getServer().getCpuCores() : 0;
        int currentRam = vm.getServer() != null ? vm.getServer().getTotalRamGb() : 0;
        int currentStorage = vm.getServer() != null ? vm.getServer().getTotalStorageGb() : 0;

        return VmDtos.VmRecommendationDto.builder()
                .id(vm.getId())
                .serverId(vm.getServer() != null ? vm.getServer().getId() : null)
                .serverName(vm.getServer() != null ? vm.getServer().getServerName() : null)
                .applicationName(vm.getServer() != null ? vm.getServer().getApplicationName() : null)
                .currentCpuCores(currentCores)
                .currentRamGb(currentRam)
                .currentStorageGb(currentStorage)
                .recommendedVcpu(vm.getRecommendedVcpu())
                .recommendedRamGb(vm.getRecommendedRamGb())
                .recommendedStorageGb(vm.getRecommendedStorageGb())
                .recommendedNetworkGbps(vm.getRecommendedNetworkGbps())
                .safetyMargin(vm.getSafetyMargin())
                .estimatedCpuUtilization(vm.getEstimatedCpuUtilization())
                .estimatedRamUtilization(vm.getEstimatedRamUtilization())
                .recommendationReason(vm.getRecommendationReason())
                .vcpuSavings(Math.max(0, currentCores - vm.getRecommendedVcpu()))
                .ramSavingsGb(Math.max(0, currentRam - vm.getRecommendedRamGb()))
                .build();
    }
}
