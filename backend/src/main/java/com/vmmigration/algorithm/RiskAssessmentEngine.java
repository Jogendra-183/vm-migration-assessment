package com.vmmigration.algorithm;

import com.vmmigration.dto.RiskDtos.ServerRiskDto;
import com.vmmigration.entity.BusinessCriticality;
import com.vmmigration.entity.DowntimeRequirement;
import com.vmmigration.entity.RiskLevel;
import com.vmmigration.entity.Server;
import com.vmmigration.repository.DependencyRepository;
import com.vmmigration.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class RiskAssessmentEngine {

    private final DependencyRepository dependencyRepository;
    private final SystemSettingRepository systemSettingRepository;

    public ServerRiskDto evaluateRisk(Server server) {
        double score = 15.0; // Base baseline risk
        List<String> riskFactors = new ArrayList<>();
        List<String> mitigations = new ArrayList<>();

        // 1. Business Criticality
        BusinessCriticality crit = server.getBusinessCriticality();
        if (crit == BusinessCriticality.CRITICAL) {
            score += 25.0;
            riskFactors.add("Critical business workload with high financial/operational impact upon disruption");
            mitigations.add("Schedule migration in isolated maintenance window with live rollback replication");
        } else if (crit == BusinessCriticality.HIGH) {
            score += 15.0;
            riskFactors.add("High business criticality requiring coordinated stakeholder notifications");
            mitigations.add("Conduct pilot staging simulation before final cutover");
        }

        // 2. Hardware Dependency
        if (Boolean.TRUE.equals(server.getHardwareDependency())) {
            score += 35.0;
            riskFactors.add("Physical hardware dependency (dongles, custom PCIe controllers, or dedicated SAN/GPU)");
            mitigations.add("Evaluate PCIe passthrough or retain on dedicated bare-metal host");
        }

        // 3. Virtualization Compatibility
        if (Boolean.FALSE.equals(server.getVirtualizationCompatibility())) {
            score += 30.0;
            riskFactors.add("Application or kernel modules are flagged incompatible with standard hypervisors");
            mitigations.add("Refactor application to modern cloud-native container or keep on physical host");
        }

        // 4. Downtime Requirement
        DowntimeRequirement downtime = server.getDowntimeRequirement();
        if (downtime == DowntimeRequirement.NONE) {
            score += 20.0;
            riskFactors.add("Strict zero-downtime SLA requirement");
            mitigations.add("Utilize hypervisor live migration (vMotion) or active-active clustering");
        } else if (downtime == DowntimeRequirement.MINIMAL) {
            score += 10.0;
            riskFactors.add("Sub-15 minute allowable cutover window");
            mitigations.add("Pre-seed storage volumes via incremental block replication");
        }

        // 5. Dependency Fan-out
        long depCount = dependencyRepository.countDependenciesForServer(server.getId());
        if (depCount >= 4) {
            score += 15.0;
            riskFactors.add("High interconnectedness (" + depCount + " upstream/downstream server dependencies)");
            mitigations.add("Group connected tier servers into coordinated same-wave migration batch");
        } else if (depCount >= 2) {
            score += 8.0;
            riskFactors.add("Multi-tier dependencies present (" + depCount + " connections)");
            mitigations.add("Perform post-migration end-to-end integration testing");
        }

        // 6. High Utilization Stress
        if (server.getPeakCpuUtilization().doubleValue() > 85.0 || server.getPeakRamUtilization().doubleValue() > 88.0) {
            score += 12.0;
            riskFactors.add("Server experiences sustained high resource spikes under peak operational load");
            mitigations.add("Allocate dedicated vCPU reservations and memory headroom in VM sizing");
        }

        // 7. Legacy OS / Server Age
        if (server.getServerAgeYears().doubleValue() > 8.0 || server.getOperatingSystem().contains("2003") || server.getOperatingSystem().contains("EOL")) {
            score += 15.0;
            riskFactors.add("Aging host hardware / deprecated operating system vintage");
            mitigations.add("Upgrade operating system and drivers during or immediately preceding migration");
        }

        // Clamp 0 - 100
        score = Math.max(5.0, Math.min(100.0, score));
        BigDecimal finalRiskScore = BigDecimal.valueOf(score).setScale(2, RoundingMode.HALF_UP);

        RiskLevel level = determineRiskLevel(finalRiskScore);

        String reason = buildRiskReason(level, riskFactors);

        return ServerRiskDto.builder()
                .serverId(server.getId())
                .serverName(server.getServerName())
                .applicationName(server.getApplicationName())
                .operatingSystem(server.getOperatingSystem())
                .riskScore(finalRiskScore)
                .riskLevel(level)
                .riskReason(reason)
                .primaryRiskFactors(riskFactors)
                .mitigationRecommendations(mitigations)
                .build();
    }

    public RiskLevel determineRiskLevel(BigDecimal riskScore) {
        double lowThreshold = getThreshold("risk_threshold_low", 30.0);
        double medThreshold = getThreshold("risk_threshold_medium", 60.0);
        double highThreshold = getThreshold("risk_threshold_high", 80.0);

        double score = riskScore.doubleValue();
        if (score <= lowThreshold) return RiskLevel.LOW;
        if (score <= medThreshold) return RiskLevel.MEDIUM;
        if (score <= highThreshold) return RiskLevel.HIGH;
        return RiskLevel.CRITICAL;
    }

    private String buildRiskReason(RiskLevel level, List<String> factors) {
        if (factors.isEmpty()) {
            return "Standard low-risk profile with modern OS and moderate resource utilization.";
        }
        return level.name() + " risk due to: " + String.join("; ", factors);
    }

    private double getThreshold(String key, double defaultValue) {
        return systemSettingRepository.findBySettingKey(key)
                .map(s -> {
                    try {
                        return Double.parseDouble(s.getSettingValue());
                    } catch (Exception e) {
                        return defaultValue;
                    }
                })
                .orElse(defaultValue);
    }
}
