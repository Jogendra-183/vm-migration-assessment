package com.vmmigration.service;

import com.vmmigration.algorithm.*;
import com.vmmigration.dto.AssessmentDtos.*;
import com.vmmigration.dto.RiskDtos.ServerRiskDto;
import com.vmmigration.entity.*;
import com.vmmigration.exception.ResourceNotFoundException;
import com.vmmigration.mapper.AssessmentMapper;
import com.vmmigration.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssessmentService {

    private final ServerRepository serverRepository;
    private final AssessmentRepository assessmentRepository;
    private final VmRecommendationRepository vmRecommendationRepository;
    private final MigrationScoringEngine scoringEngine;
    private final RiskAssessmentEngine riskEngine;
    private final MigrationClassificationEngine classificationEngine;
    private final VmSizingEngine sizingEngine;
    private final MigrationPriorityEngine priorityEngine;
    private final MigrationWaveEngine waveEngine;
    private final ConsolidationEngine consolidationEngine;
    private final AssessmentMapper assessmentMapper;

    @Transactional
    public AssessmentRunResponse runFullAssessment() {
        List<Server> allServers = serverRepository.findAll();
        List<Assessment> assessmentsToSave = new ArrayList<>();
        List<VmRecommendation> recommendationsToSave = new ArrayList<>();

        for (Server server : allServers) {
            // 1. Scoring Engine
            ScoreBreakdownDto scoreBreakdown = scoringEngine.calculateScores(server);
            BigDecimal migrationScore = scoreBreakdown.getWeightedTotal();

            // 2. Risk Engine
            ServerRiskDto riskDto = riskEngine.evaluateRisk(server);
            BigDecimal riskScore = riskDto.getRiskScore();
            RiskLevel riskLevel = riskDto.getRiskLevel();

            // 3. Classification Engine
            MigrationClassificationEngine.ClassificationResult classResult =
                    classificationEngine.determineClassification(server, migrationScore, riskScore, riskLevel);

            // 4. Priority Engine
            MigrationPriorityEngine.PriorityResult priorityResult =
                    priorityEngine.calculatePriority(server, migrationScore, riskScore, classResult.getClassification());

            // 5. VM Sizing Engine
            VmRecommendation vmRecommendation = sizingEngine.calculateRecommendation(server);

            // Create or update assessment entity
            Assessment assessment = server.getAssessment();
            if (assessment == null) {
                assessment = Assessment.builder().server(server).build();
            }
            assessment.setMigrationScore(migrationScore);
            assessment.setClassification(classResult.getClassification());
            assessment.setRiskScore(riskScore);
            assessment.setRiskLevel(riskLevel);
            assessment.setPriorityScore(priorityResult.priorityScore);
            assessment.setMigrationPriority(priorityResult.priority);
            assessment.setReason(classResult.getReason());
            assessment.setAssessedAt(OffsetDateTime.now());

            assessmentsToSave.add(assessment);

            // Save VM recommendation
            VmRecommendation existingVm = server.getVmRecommendation();
            if (existingVm != null) {
                existingVm.setRecommendedVcpu(vmRecommendation.getRecommendedVcpu());
                existingVm.setRecommendedRamGb(vmRecommendation.getRecommendedRamGb());
                existingVm.setRecommendedStorageGb(vmRecommendation.getRecommendedStorageGb());
                existingVm.setRecommendedNetworkGbps(vmRecommendation.getRecommendedNetworkGbps());
                existingVm.setSafetyMargin(vmRecommendation.getSafetyMargin());
                existingVm.setEstimatedCpuUtilization(vmRecommendation.getEstimatedCpuUtilization());
                existingVm.setEstimatedRamUtilization(vmRecommendation.getEstimatedRamUtilization());
                existingVm.setRecommendationReason(vmRecommendation.getRecommendationReason());
                recommendationsToSave.add(existingVm);
            } else {
                recommendationsToSave.add(vmRecommendation);
            }
        }

        assessmentRepository.saveAll(assessmentsToSave);
        vmRecommendationRepository.saveAll(recommendationsToSave);

        // 6. Generate Migration Waves
        waveEngine.generateWaves();

        // 7. Calculate Server Consolidation
        consolidationEngine.calculateConsolidation(null, null, null);

        // Build Response
        AssessmentSummaryDto summary = getAssessmentSummary();
        List<AssessmentDto> results = assessmentRepository.findAll().stream()
                .map(a -> {
                    AssessmentDto dto = assessmentMapper.toDto(a);
                    dto.setScoreBreakdown(scoringEngine.calculateScores(a.getServer()));
                    return dto;
                })
                .collect(Collectors.toList());

        return AssessmentRunResponse.builder()
                .success(true)
                .message("Full migration assessment and simulation completed successfully for " + allServers.size() + " servers.")
                .assessedServersCount(allServers.size())
                .summary(summary)
                .results(results)
                .build();
    }

    public AssessmentSummaryDto getAssessmentSummary() {
        List<Assessment> assessments = assessmentRepository.findAll();
        long total = assessments.size();
        if (total == 0) {
            return AssessmentSummaryDto.builder()
                    .totalServers(0)
                    .readyToMigrate(0)
                    .requiresOptimization(0)
                    .retire(0)
                    .keepPhysical(0)
                    .readinessPercentage(BigDecimal.ZERO)
                    .averageMigrationScore(BigDecimal.ZERO)
                    .classificationDistribution(Collections.emptyMap())
                    .riskDistribution(Collections.emptyMap())
                    .priorityDistribution(Collections.emptyMap())
                    .build();
        }

        long ready = assessments.stream().filter(a -> a.getClassification() == Classification.READY_TO_MIGRATE).count();
        long opt = assessments.stream().filter(a -> a.getClassification() == Classification.REQUIRES_OPTIMIZATION).count();
        long retire = assessments.stream().filter(a -> a.getClassification() == Classification.RETIRE).count();
        long keep = assessments.stream().filter(a -> a.getClassification() == Classification.KEEP_PHYSICAL).count();

        double avgScore = assessments.stream().mapToDouble(a -> a.getMigrationScore().doubleValue()).average().orElse(0.0);
        double readinessPct = ((double) ready / total) * 100.0;

        Map<Classification, Long> classMap = assessments.stream()
                .collect(Collectors.groupingBy(Assessment::getClassification, Collectors.counting()));
        Map<RiskLevel, Long> riskMap = assessments.stream()
                .collect(Collectors.groupingBy(Assessment::getRiskLevel, Collectors.counting()));
        Map<MigrationPriority, Long> priorityMap = assessments.stream()
                .collect(Collectors.groupingBy(Assessment::getMigrationPriority, Collectors.counting()));

        OffsetDateTime lastAssessed = assessments.stream()
                .map(Assessment::getAssessedAt)
                .filter(Objects::nonNull)
                .max(OffsetDateTime::compareTo)
                .orElse(OffsetDateTime.now());

        return AssessmentSummaryDto.builder()
                .totalServers(total)
                .readyToMigrate(ready)
                .requiresOptimization(opt)
                .retire(retire)
                .keepPhysical(keep)
                .readinessPercentage(BigDecimal.valueOf(readinessPct).setScale(1, RoundingMode.HALF_UP))
                .averageMigrationScore(BigDecimal.valueOf(avgScore).setScale(1, RoundingMode.HALF_UP))
                .classificationDistribution(classMap)
                .riskDistribution(riskMap)
                .priorityDistribution(priorityMap)
                .lastAssessedAt(lastAssessed)
                .build();
    }

    @Transactional
    public AssessmentDto assessSingleServer(Long serverId) {
        Server server = serverRepository.findById(serverId)
                .orElseThrow(() -> new ResourceNotFoundException("Server not found with ID: " + serverId));

        ScoreBreakdownDto scoreBreakdown = scoringEngine.calculateScores(server);
        BigDecimal migrationScore = scoreBreakdown.getWeightedTotal();

        ServerRiskDto riskDto = riskEngine.evaluateRisk(server);
        BigDecimal riskScore = riskDto.getRiskScore();
        RiskLevel riskLevel = riskDto.getRiskLevel();

        MigrationClassificationEngine.ClassificationResult classResult =
                classificationEngine.determineClassification(server, migrationScore, riskScore, riskLevel);

        MigrationPriorityEngine.PriorityResult priorityResult =
                priorityEngine.calculatePriority(server, migrationScore, riskScore, classResult.getClassification());

        VmRecommendation vmRecommendation = sizingEngine.calculateRecommendation(server);

        Assessment assessment = server.getAssessment();
        if (assessment == null) {
            assessment = Assessment.builder().server(server).build();
        }
        assessment.setMigrationScore(migrationScore);
        assessment.setClassification(classResult.getClassification());
        assessment.setRiskScore(riskScore);
        assessment.setRiskLevel(riskLevel);
        assessment.setPriorityScore(priorityResult.priorityScore);
        assessment.setMigrationPriority(priorityResult.priority);
        assessment.setReason(classResult.getReason());
        assessment.setAssessedAt(OffsetDateTime.now());

        Assessment savedAssessment = assessmentRepository.save(assessment);

        VmRecommendation existingVm = server.getVmRecommendation();
        if (existingVm != null) {
            existingVm.setRecommendedVcpu(vmRecommendation.getRecommendedVcpu());
            existingVm.setRecommendedRamGb(vmRecommendation.getRecommendedRamGb());
            existingVm.setRecommendedStorageGb(vmRecommendation.getRecommendedStorageGb());
            existingVm.setRecommendedNetworkGbps(vmRecommendation.getRecommendedNetworkGbps());
            existingVm.setSafetyMargin(vmRecommendation.getSafetyMargin());
            existingVm.setEstimatedCpuUtilization(vmRecommendation.getEstimatedCpuUtilization());
            existingVm.setEstimatedRamUtilization(vmRecommendation.getEstimatedRamUtilization());
            existingVm.setRecommendationReason(vmRecommendation.getRecommendationReason());
            vmRecommendationRepository.save(existingVm);
        } else {
            vmRecommendationRepository.save(vmRecommendation);
        }

        // Re-run wave distribution & consolidation
        waveEngine.generateWaves();
        consolidationEngine.calculateConsolidation(null, null, null);

        AssessmentDto dto = assessmentMapper.toDto(savedAssessment);
        dto.setScoreBreakdown(scoreBreakdown);
        return dto;
    }

    public List<AssessmentDto> getAllAssessments() {
        return assessmentRepository.findAll().stream()
                .map(a -> {
                    AssessmentDto dto = assessmentMapper.toDto(a);
                    dto.setScoreBreakdown(scoringEngine.calculateScores(a.getServer()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public AssessmentDto getAssessmentByServerId(Long serverId) {
        Assessment assessment = assessmentRepository.findByServerId(serverId)
                .orElseThrow(() -> new ResourceNotFoundException("No assessment found for server ID: " + serverId));
        AssessmentDto dto = assessmentMapper.toDto(assessment);
        dto.setScoreBreakdown(scoringEngine.calculateScores(assessment.getServer()));
        return dto;
    }
}
