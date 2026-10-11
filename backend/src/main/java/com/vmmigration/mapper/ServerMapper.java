package com.vmmigration.mapper;

import com.vmmigration.dto.ServerDtos;
import com.vmmigration.entity.Server;
import org.springframework.stereotype.Component;

@Component
public class ServerMapper {

    public ServerDtos.ServerDto toDto(Server server) {
        if (server == null) {
            return null;
        }

        ServerDtos.ServerDto.ServerDtoBuilder builder = ServerDtos.ServerDto.builder()
                .id(server.getId())
                .serverName(server.getServerName())
                .hostname(server.getHostname())
                .ipAddress(server.getIpAddress())
                .operatingSystem(server.getOperatingSystem())
                .osVersion(server.getOsVersion())
                .cpuModel(server.getCpuModel())
                .cpuCores(server.getCpuCores())
                .totalRamGb(server.getTotalRamGb())
                .totalStorageGb(server.getTotalStorageGb())
                .storageType(server.getStorageType())
                .networkBandwidthGbps(server.getNetworkBandwidthGbps())
                .averageCpuUtilization(server.getAverageCpuUtilization())
                .peakCpuUtilization(server.getPeakCpuUtilization())
                .averageRamUtilization(server.getAverageRamUtilization())
                .peakRamUtilization(server.getPeakRamUtilization())
                .averageStorageUtilization(server.getAverageStorageUtilization())
                .averageNetworkUtilization(server.getAverageNetworkUtilization())
                .applicationName(server.getApplicationName())
                .applicationType(server.getApplicationType())
                .applicationOwner(server.getApplicationOwner())
                .businessCriticality(server.getBusinessCriticality())
                .downtimeRequirement(server.getDowntimeRequirement())
                .hardwareDependency(server.getHardwareDependency())
                .virtualizationCompatibility(server.getVirtualizationCompatibility())
                .serverAgeYears(server.getServerAgeYears())
                .maintenanceStatus(server.getMaintenanceStatus())
                .currentStatus(server.getCurrentStatus())
                .createdAt(server.getCreatedAt())
                .updatedAt(server.getUpdatedAt());

        if (server.getAssessment() != null) {
            builder.migrationScore(server.getAssessment().getMigrationScore())
                   .classification(server.getAssessment().getClassification())
                   .riskLevel(server.getAssessment().getRiskLevel())
                   .riskScore(server.getAssessment().getRiskScore())
                   .migrationPriority(server.getAssessment().getMigrationPriority());
        }

        if (server.getVmRecommendation() != null) {
            builder.recommendedVcpu(server.getVmRecommendation().getRecommendedVcpu())
                   .recommendedRamGb(server.getVmRecommendation().getRecommendedRamGb())
                   .recommendedStorageGb(server.getVmRecommendation().getRecommendedStorageGb());
        }

        if (server.getWaveAssignment() != null && server.getWaveAssignment().getWave() != null) {
            builder.assignedWaveNumber(server.getWaveAssignment().getWave().getWaveNumber())
                   .assignedWaveName(server.getWaveAssignment().getWave().getWaveName());
        }

        return builder.build();
    }

    public Server toEntity(ServerDtos.ServerCreateRequest request) {
        if (request == null) {
            return null;
        }

        return Server.builder()
                .serverName(request.getServerName())
                .hostname(request.getHostname())
                .ipAddress(request.getIpAddress())
                .operatingSystem(request.getOperatingSystem())
                .osVersion(request.getOsVersion())
                .cpuModel(request.getCpuModel())
                .cpuCores(request.getCpuCores())
                .totalRamGb(request.getTotalRamGb())
                .totalStorageGb(request.getTotalStorageGb())
                .storageType(request.getStorageType())
                .networkBandwidthGbps(request.getNetworkBandwidthGbps())
                .averageCpuUtilization(request.getAverageCpuUtilization())
                .peakCpuUtilization(request.getPeakCpuUtilization())
                .averageRamUtilization(request.getAverageRamUtilization())
                .peakRamUtilization(request.getPeakRamUtilization())
                .averageStorageUtilization(request.getAverageStorageUtilization())
                .averageNetworkUtilization(request.getAverageNetworkUtilization())
                .applicationName(request.getApplicationName())
                .applicationType(request.getApplicationType())
                .applicationOwner(request.getApplicationOwner())
                .businessCriticality(request.getBusinessCriticality())
                .downtimeRequirement(request.getDowntimeRequirement())
                .hardwareDependency(request.getHardwareDependency() != null ? request.getHardwareDependency() : false)
                .virtualizationCompatibility(request.getVirtualizationCompatibility() != null ? request.getVirtualizationCompatibility() : true)
                .serverAgeYears(request.getServerAgeYears())
                .maintenanceStatus(request.getMaintenanceStatus() != null ? request.getMaintenanceStatus() : "ACTIVE")
                .currentStatus(request.getCurrentStatus() != null ? request.getCurrentStatus() : "RUNNING")
                .build();
    }

    public void updateEntityFromRequest(Server server, ServerDtos.ServerUpdateRequest request) {
        if (server == null || request == null) {
            return;
        }
        if (request.getHostname() != null) server.setHostname(request.getHostname());
        if (request.getIpAddress() != null) server.setIpAddress(request.getIpAddress());
        if (request.getOperatingSystem() != null) server.setOperatingSystem(request.getOperatingSystem());
        if (request.getOsVersion() != null) server.setOsVersion(request.getOsVersion());
        if (request.getCpuModel() != null) server.setCpuModel(request.getCpuModel());
        if (request.getCpuCores() != null) server.setCpuCores(request.getCpuCores());
        if (request.getTotalRamGb() != null) server.setTotalRamGb(request.getTotalRamGb());
        if (request.getTotalStorageGb() != null) server.setTotalStorageGb(request.getTotalStorageGb());
        if (request.getStorageType() != null) server.setStorageType(request.getStorageType());
        if (request.getNetworkBandwidthGbps() != null) server.setNetworkBandwidthGbps(request.getNetworkBandwidthGbps());
        if (request.getAverageCpuUtilization() != null) server.setAverageCpuUtilization(request.getAverageCpuUtilization());
        if (request.getPeakCpuUtilization() != null) server.setPeakCpuUtilization(request.getPeakCpuUtilization());
        if (request.getAverageRamUtilization() != null) server.setAverageRamUtilization(request.getAverageRamUtilization());
        if (request.getPeakRamUtilization() != null) server.setPeakRamUtilization(request.getPeakRamUtilization());
        if (request.getAverageStorageUtilization() != null) server.setAverageStorageUtilization(request.getAverageStorageUtilization());
        if (request.getAverageNetworkUtilization() != null) server.setAverageNetworkUtilization(request.getAverageNetworkUtilization());
        if (request.getApplicationName() != null) server.setApplicationName(request.getApplicationName());
        if (request.getApplicationType() != null) server.setApplicationType(request.getApplicationType());
        if (request.getApplicationOwner() != null) server.setApplicationOwner(request.getApplicationOwner());
        if (request.getBusinessCriticality() != null) server.setBusinessCriticality(request.getBusinessCriticality());
        if (request.getDowntimeRequirement() != null) server.setDowntimeRequirement(request.getDowntimeRequirement());
        if (request.getHardwareDependency() != null) server.setHardwareDependency(request.getHardwareDependency());
        if (request.getVirtualizationCompatibility() != null) server.setVirtualizationCompatibility(request.getVirtualizationCompatibility());
        if (request.getServerAgeYears() != null) server.setServerAgeYears(request.getServerAgeYears());
        if (request.getMaintenanceStatus() != null) server.setMaintenanceStatus(request.getMaintenanceStatus());
        if (request.getCurrentStatus() != null) server.setCurrentStatus(request.getCurrentStatus());
    }
}
