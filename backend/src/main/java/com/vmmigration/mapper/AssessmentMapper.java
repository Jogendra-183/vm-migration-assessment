package com.vmmigration.mapper;

import com.vmmigration.dto.AssessmentDtos;
import com.vmmigration.entity.Assessment;
import org.springframework.stereotype.Component;

@Component
public class AssessmentMapper {

    public AssessmentDtos.AssessmentDto toDto(Assessment assessment) {
        if (assessment == null) {
            return null;
        }

        return AssessmentDtos.AssessmentDto.builder()
                .id(assessment.getId())
                .serverId(assessment.getServer() != null ? assessment.getServer().getId() : null)
                .serverName(assessment.getServer() != null ? assessment.getServer().getServerName() : null)
                .applicationName(assessment.getServer() != null ? assessment.getServer().getApplicationName() : null)
                .migrationScore(assessment.getMigrationScore())
                .classification(assessment.getClassification())
                .riskScore(assessment.getRiskScore())
                .riskLevel(assessment.getRiskLevel())
                .priorityScore(assessment.getPriorityScore())
                .migrationPriority(assessment.getMigrationPriority())
                .reason(assessment.getReason())
                .assessedAt(assessment.getAssessedAt())
                .build();
    }
}
