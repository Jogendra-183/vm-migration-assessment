package com.vmmigration.service;

import com.vmmigration.algorithm.VmSizingEngine;
import com.vmmigration.dto.VmDtos.*;
import com.vmmigration.entity.Server;
import com.vmmigration.entity.VmRecommendation;
import com.vmmigration.exception.ResourceNotFoundException;
import com.vmmigration.mapper.VmRecommendationMapper;
import com.vmmigration.repository.ServerRepository;
import com.vmmigration.repository.VmRecommendationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VmRecommendationService {

    private final VmRecommendationRepository vmRecommendationRepository;
    private final ServerRepository serverRepository;
    private final VmRecommendationMapper vmRecommendationMapper;
    private final VmSizingEngine sizingEngine;

    @Transactional
    public List<VmRecommendationDto> getAllRecommendations() {
        List<Server> servers = serverRepository.findAll();
        List<VmRecommendation> recommendations = vmRecommendationRepository.findAll();
        Set<Long> existingServerIds = recommendations.stream()
                .filter(r -> r.getServer() != null)
                .map(r -> r.getServer().getId())
                .collect(Collectors.toSet());

        List<VmRecommendation> toAdd = new ArrayList<>();
        for (Server s : servers) {
            if (!existingServerIds.contains(s.getId())) {
                VmRecommendation rec = sizingEngine.calculateRecommendation(s);
                toAdd.add(rec);
            }
        }
        if (!toAdd.isEmpty()) {
            recommendations.addAll(vmRecommendationRepository.saveAll(toAdd));
        }

        return recommendations.stream()
                .map(vmRecommendationMapper::toDto)
                .collect(Collectors.toList());
    }

    public VmRecommendationDto getRecommendationByServerId(Long serverId) {
        VmRecommendation vm = vmRecommendationRepository.findByServerId(serverId)
                .orElseGet(() -> {
                    Server server = serverRepository.findById(serverId)
                            .orElseThrow(() -> new ResourceNotFoundException("No server found with ID: " + serverId));
                    VmRecommendation rec = sizingEngine.calculateRecommendation(server);
                    return vmRecommendationRepository.save(rec);
                });
        return vmRecommendationMapper.toDto(vm);
    }

    @Transactional
    public VmRecommendationSummaryDto getSummary() {
        List<Server> servers = serverRepository.findAll();
        List<VmRecommendationDto> recommendationDtos = getAllRecommendations();

        int totalPhysicalCores = servers.stream().mapToInt(Server::getCpuCores).sum();
        int totalPhysicalRamGb = servers.stream().mapToInt(Server::getTotalRamGb).sum();
        int totalPhysicalStorageGb = servers.stream().mapToInt(Server::getTotalStorageGb).sum();

        int totalRecommendedVcpu = recommendationDtos.stream().mapToInt(VmRecommendationDto::getRecommendedVcpu).sum();
        int totalRecommendedRamGb = recommendationDtos.stream().mapToInt(VmRecommendationDto::getRecommendedRamGb).sum();
        int totalRecommendedStorageGb = recommendationDtos.stream().mapToInt(VmRecommendationDto::getRecommendedStorageGb).sum();

        double cpuReduction = totalPhysicalCores > 0
                ? ((double) (totalPhysicalCores - totalRecommendedVcpu) / totalPhysicalCores) * 100.0
                : 0.0;
        double ramReduction = totalPhysicalRamGb > 0
                ? ((double) (totalPhysicalRamGb - totalRecommendedRamGb) / totalPhysicalRamGb) * 100.0
                : 0.0;

        return VmRecommendationSummaryDto.builder()
                .totalRecommendedVms(recommendationDtos.size())
                .totalPhysicalCores(totalPhysicalCores)
                .totalRecommendedVcpu(totalRecommendedVcpu)
                .totalPhysicalRamGb(totalPhysicalRamGb)
                .totalRecommendedRamGb(totalRecommendedRamGb)
                .totalPhysicalStorageGb(totalPhysicalStorageGb)
                .totalRecommendedStorageGb(totalRecommendedStorageGb)
                .cpuCapacityReductionPercent(BigDecimal.valueOf(Math.max(0, cpuReduction)).setScale(1, RoundingMode.HALF_UP))
                .ramCapacityReductionPercent(BigDecimal.valueOf(Math.max(0, ramReduction)).setScale(1, RoundingMode.HALF_UP))
                .build();
    }
}
