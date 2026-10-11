package com.vmmigration.service;

import com.vmmigration.dto.PriorityDtos.*;
import com.vmmigration.entity.Assessment;
import com.vmmigration.entity.Server;
import com.vmmigration.exception.ResourceNotFoundException;
import com.vmmigration.repository.AssessmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MigrationPriorityService {

    private final AssessmentRepository assessmentRepository;

    public List<ServerPriorityDto> getAllPriorities() {
        return assessmentRepository.findAll().stream()
                .map(this::toPriorityDto)
                .sorted((a, b) -> a.getEffectivePriority().compareTo(b.getEffectivePriority()))
                .collect(Collectors.toList());
    }

    @Transactional
    public ServerPriorityDto overridePriority(Long serverId, PriorityOverrideRequest request) {
        Assessment assessment = assessmentRepository.findByServerId(serverId)
                .orElseThrow(() -> new ResourceNotFoundException("No assessment found for server ID: " + serverId));

        assessment.setMigrationPriority(request.getPriority());
        if (request.getOverrideReason() != null && !request.getOverrideReason().isBlank()) {
            assessment.setReason(assessment.getReason() + " [Admin Priority Override: " + request.getOverrideReason() + "]");
        }
        assessmentRepository.save(assessment);

        return toPriorityDto(assessment);
    }

    private ServerPriorityDto toPriorityDto(Assessment a) {
        Server s = a.getServer();
        return ServerPriorityDto.builder()
                .serverId(s.getId())
                .serverName(s.getServerName())
                .applicationName(s.getApplicationName())
                .classification(a.getClassification())
                .migrationScore(a.getMigrationScore())
                .riskScore(a.getRiskScore())
                .riskLevel(a.getRiskLevel())
                .priorityScore(a.getPriorityScore())
                .calculatedPriority(a.getMigrationPriority())
                .effectivePriority(a.getMigrationPriority())
                .isOverridden(a.getReason() != null && a.getReason().contains("Admin Priority Override"))
                .priorityReason(a.getReason())
                .build();
    }
}
