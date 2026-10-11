package com.vmmigration.algorithm;

import com.vmmigration.entity.BusinessCriticality;
import com.vmmigration.entity.Classification;
import com.vmmigration.entity.RiskLevel;
import com.vmmigration.entity.Server;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class MigrationClassificationEngine {

    @Getter
    public static class ClassificationResult {
        private final Classification classification;
        private final String reason;

        public ClassificationResult(Classification classification, String reason) {
            this.classification = classification;
            this.reason = reason;
        }
    }

    public ClassificationResult determineClassification(Server server, BigDecimal migrationScore, BigDecimal riskScore, RiskLevel riskLevel) {
        String status = server.getCurrentStatus() != null ? server.getCurrentStatus().toUpperCase() : "";
        String maint = server.getMaintenanceStatus() != null ? server.getMaintenanceStatus().toUpperCase() : "";
        String os = server.getOperatingSystem() != null ? server.getOperatingSystem().toLowerCase() : "";

        // 1. Check for RETIRE
        if (status.contains("DECOMMISSION") || status.contains("INACTIVE") ||
            maint.contains("END_OF_LIFE") || maint.contains("DEPRECATED") ||
            (server.getServerAgeYears().doubleValue() >= 10.0 && server.getBusinessCriticality() == BusinessCriticality.LOW)) {
            return new ClassificationResult(
                    Classification.RETIRE,
                    String.format("Server is marked for retirement (%s / %s) with obsolete hardware (age %.1f years) and deprecated OS vintage (%s). Decommission workload instead of migrating.",
                            server.getMaintenanceStatus(), server.getCurrentStatus(), server.getServerAgeYears().doubleValue(), server.getOperatingSystem())
            );
        }

        // 2. Check for KEEP_PHYSICAL
        if (Boolean.TRUE.equals(server.getHardwareDependency()) ||
            Boolean.FALSE.equals(server.getVirtualizationCompatibility()) ||
            (riskLevel == RiskLevel.CRITICAL && server.getBusinessCriticality() == BusinessCriticality.CRITICAL && server.getCpuCores() >= 64)) {
            
            String specificFactor = "";
            if (Boolean.TRUE.equals(server.getHardwareDependency())) {
                specificFactor = "critical hardware lock-in (PCIe hardware key / dedicated SAN / GPU / HSM)";
            } else if (Boolean.FALSE.equals(server.getVirtualizationCompatibility())) {
                specificFactor = "application or legacy platform virtualization incompatibility";
            } else {
                specificFactor = "extreme latency sensitivity and massive bare-metal resource footprint";
            }

            return new ClassificationResult(
                    Classification.KEEP_PHYSICAL,
                    String.format("Server must remain physical due to %s. Migration risk is %s (Risk Score: %s).",
                            specificFactor, riskLevel, riskScore)
            );
        }

        // 3. Check for REQUIRES_OPTIMIZATION
        boolean highPeakCpu = server.getPeakCpuUtilization().doubleValue() >= 80.0;
        boolean highPeakRam = server.getPeakRamUtilization().doubleValue() >= 85.0;
        boolean highStorage = server.getAverageStorageUtilization().doubleValue() >= 75.0;
        boolean olderOs = os.contains("2016") || os.contains("7.") || os.contains("18.04") || os.contains("freebsd");

        if (highPeakCpu || highPeakRam || highStorage || olderOs || migrationScore.doubleValue() < 65.0 || riskLevel == RiskLevel.HIGH) {
            StringBuilder issues = new StringBuilder();
            if (highPeakCpu) issues.append("peak CPU spikes reaching ").append(server.getPeakCpuUtilization()).append("%, ");
            if (highPeakRam) issues.append("peak RAM utilization reaching ").append(server.getPeakRamUtilization()).append("%, ");
            if (highStorage) issues.append("storage capacity at ").append(server.getAverageStorageUtilization()).append("%, ");
            if (olderOs) issues.append("OS version (").append(server.getOperatingSystem()).append(" ").append(server.getOsVersion()).append(") requiring pre-migration patching, ");

            String issueText = issues.length() > 0 ? issues.substring(0, issues.length() - 2) : "moderate virtualization suitability score (" + migrationScore + ")";

            return new ClassificationResult(
                    Classification.REQUIRES_OPTIMIZATION,
                    String.format("Suitable for virtualization but requires optimization prior to cutover: %s. Recommended to right-size memory limits and tune OS workloads.", issueText)
            );
        }

        // 4. READY_TO_MIGRATE
        return new ClassificationResult(
                Classification.READY_TO_MIGRATE,
                String.format("Ready to migrate because CPU utilization is low to moderate (avg %s%%, peak %s%%), RAM headroom is healthy (avg %s%%), the application is virtualization-compatible, and no physical hardware dependencies exist.",
                        server.getAverageCpuUtilization(), server.getPeakCpuUtilization(), server.getAverageRamUtilization())
        );
    }
}
