package com.vmmigration.service;

import com.vmmigration.algorithm.RiskAssessmentEngine;
import com.vmmigration.dto.RiskDtos.*;
import com.vmmigration.entity.RiskLevel;
import com.vmmigration.entity.Server;
import com.vmmigration.exception.ResourceNotFoundException;
import com.vmmigration.repository.ServerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RiskService {

    private final ServerRepository serverRepository;
    private final RiskAssessmentEngine riskAssessmentEngine;

    public List<ServerRiskDto> getAllServerRisks() {
        return serverRepository.findAll().stream()
                .map(riskAssessmentEngine::evaluateRisk)
                .collect(Collectors.toList());
    }

    public ServerRiskDto getServerRisk(Long serverId) {
        Server server = serverRepository.findById(serverId)
                .orElseThrow(() -> new ResourceNotFoundException("Server not found with ID: " + serverId));
        return riskAssessmentEngine.evaluateRisk(server);
    }

    public RiskMatrixDto getRiskMatrix() {
        List<ServerRiskDto> allRisks = getAllServerRisks();

        long low = allRisks.stream().filter(r -> r.getRiskLevel() == RiskLevel.LOW).count();
        long med = allRisks.stream().filter(r -> r.getRiskLevel() == RiskLevel.MEDIUM).count();
        long high = allRisks.stream().filter(r -> r.getRiskLevel() == RiskLevel.HIGH).count();
        long crit = allRisks.stream().filter(r -> r.getRiskLevel() == RiskLevel.CRITICAL).count();

        List<ServerRiskDto> highAndCritical = allRisks.stream()
                .filter(r -> r.getRiskLevel() == RiskLevel.HIGH || r.getRiskLevel() == RiskLevel.CRITICAL)
                .sorted((a, b) -> b.getRiskScore().compareTo(a.getRiskScore()))
                .collect(Collectors.toList());

        Map<String, Integer> freqMap = new HashMap<>();
        for (ServerRiskDto risk : allRisks) {
            for (String factor : risk.getPrimaryRiskFactors()) {
                freqMap.put(factor, freqMap.getOrDefault(factor, 0) + 1);
            }
        }

        return RiskMatrixDto.builder()
                .totalServers(allRisks.size())
                .lowRiskCount(low)
                .mediumRiskCount(med)
                .highRiskCount(high)
                .criticalRiskCount(crit)
                .highAndCriticalRiskServers(highAndCritical)
                .commonRiskFactorFrequency(freqMap)
                .build();
    }
}
