package com.vmmigration.algorithm;

import com.vmmigration.dto.AssessmentDtos.ScoreBreakdownDto;
import com.vmmigration.entity.BusinessCriticality;
import com.vmmigration.entity.Server;
import com.vmmigration.repository.DependencyRepository;
import com.vmmigration.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
@RequiredArgsConstructor
public class MigrationScoringEngine {

    private final SystemSettingRepository systemSettingRepository;
    private final DependencyRepository dependencyRepository;

    public ScoreBreakdownDto calculateScores(Server server) {
        BigDecimal wCpu = getSettingDecimal("weight_cpu", BigDecimal.valueOf(0.25));
        BigDecimal wRam = getSettingDecimal("weight_ram", BigDecimal.valueOf(0.20));
        BigDecimal wStorage = getSettingDecimal("weight_storage", BigDecimal.valueOf(0.10));
        BigDecimal wNetwork = getSettingDecimal("weight_network", BigDecimal.valueOf(0.10));
        BigDecimal wCompat = getSettingDecimal("weight_compatibility", BigDecimal.valueOf(0.15));
        BigDecimal wDep = getSettingDecimal("weight_dependencies", BigDecimal.valueOf(0.10));
        BigDecimal wCrit = getSettingDecimal("weight_criticality", BigDecimal.valueOf(0.10));

        BigDecimal cpuScore = calculateCpuScore(server);
        BigDecimal ramScore = calculateRamScore(server);
        BigDecimal storageScore = calculateStorageScore(server);
        BigDecimal networkScore = calculateNetworkScore(server);
        BigDecimal compatScore = calculateCompatibilityScore(server);
        BigDecimal depScore = calculateDependencyScore(server);
        BigDecimal critScore = calculateCriticalityScore(server);

        BigDecimal weightedTotal = cpuScore.multiply(wCpu)
                .add(ramScore.multiply(wRam))
                .add(storageScore.multiply(wStorage))
                .add(networkScore.multiply(wNetwork))
                .add(compatScore.multiply(wCompat))
                .add(depScore.multiply(wDep))
                .add(critScore.multiply(wCrit))
                .setScale(2, RoundingMode.HALF_UP);

        // Clamp between 0 and 100
        if (weightedTotal.compareTo(BigDecimal.ZERO) < 0) weightedTotal = BigDecimal.ZERO;
        if (weightedTotal.compareTo(BigDecimal.valueOf(100)) > 0) weightedTotal = BigDecimal.valueOf(100);

        return ScoreBreakdownDto.builder()
                .cpuScore(cpuScore)
                .ramScore(ramScore)
                .storageScore(storageScore)
                .networkScore(networkScore)
                .compatibilityScore(compatScore)
                .dependencyScore(depScore)
                .criticalityScore(critScore)
                .weightedTotal(weightedTotal)
                .build();
    }

    private BigDecimal calculateCpuScore(Server server) {
        double peak = server.getPeakCpuUtilization().doubleValue();
        // Lower peak utilization means higher virtualization suitability
        if (peak <= 40.0) return BigDecimal.valueOf(95.0);
        if (peak <= 65.0) return BigDecimal.valueOf(85.0);
        if (peak <= 80.0) return BigDecimal.valueOf(65.0);
        if (peak <= 90.0) return BigDecimal.valueOf(40.0);
        return BigDecimal.valueOf(20.0);
    }

    private BigDecimal calculateRamScore(Server server) {
        double peak = server.getPeakRamUtilization().doubleValue();
        if (peak <= 50.0) return BigDecimal.valueOf(95.0);
        if (peak <= 75.0) return BigDecimal.valueOf(85.0);
        if (peak <= 88.0) return BigDecimal.valueOf(60.0);
        return BigDecimal.valueOf(30.0);
    }

    private BigDecimal calculateStorageScore(Server server) {
        double avg = server.getAverageStorageUtilization().doubleValue();
        if (avg <= 50.0) return BigDecimal.valueOf(90.0);
        if (avg <= 75.0) return BigDecimal.valueOf(80.0);
        if (avg <= 88.0) return BigDecimal.valueOf(55.0);
        return BigDecimal.valueOf(35.0);
    }

    private BigDecimal calculateNetworkScore(Server server) {
        double avg = server.getAverageNetworkUtilization().doubleValue();
        if (avg <= 40.0) return BigDecimal.valueOf(90.0);
        if (avg <= 70.0) return BigDecimal.valueOf(75.0);
        return BigDecimal.valueOf(50.0);
    }

    private BigDecimal calculateCompatibilityScore(Server server) {
        if (Boolean.TRUE.equals(server.getHardwareDependency())) {
            return BigDecimal.valueOf(10.0);
        }
        if (Boolean.FALSE.equals(server.getVirtualizationCompatibility())) {
            return BigDecimal.valueOf(15.0);
        }
        String os = server.getOperatingSystem().toLowerCase();
        if (os.contains("2003") || os.contains("2008") || os.contains("eol")) {
            return BigDecimal.valueOf(35.0);
        }
        return BigDecimal.valueOf(95.0);
    }

    private BigDecimal calculateDependencyScore(Server server) {
        long depCount = dependencyRepository.countDependenciesForServer(server.getId());
        if (depCount == 0) return BigDecimal.valueOf(100.0);
        if (depCount <= 2) return BigDecimal.valueOf(85.0);
        if (depCount <= 4) return BigDecimal.valueOf(65.0);
        return BigDecimal.valueOf(45.0);
    }

    private BigDecimal calculateCriticalityScore(Server server) {
        BusinessCriticality crit = server.getBusinessCriticality();
        if (crit == BusinessCriticality.LOW) return BigDecimal.valueOf(95.0);
        if (crit == BusinessCriticality.MEDIUM) return BigDecimal.valueOf(80.0);
        if (crit == BusinessCriticality.HIGH) return BigDecimal.valueOf(60.0);
        return BigDecimal.valueOf(35.0); // CRITICAL
    }

    private BigDecimal getSettingDecimal(String key, BigDecimal defaultValue) {
        return systemSettingRepository.findBySettingKey(key)
                .map(s -> {
                    try {
                        return new BigDecimal(s.getSettingValue());
                    } catch (Exception e) {
                        return defaultValue;
                    }
                })
                .orElse(defaultValue);
    }
}
