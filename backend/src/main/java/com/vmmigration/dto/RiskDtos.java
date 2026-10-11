package com.vmmigration.dto;

import com.vmmigration.entity.RiskLevel;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class RiskDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ServerRiskDto {
        private Long serverId;
        private String serverName;
        private String applicationName;
        private String operatingSystem;
        private BigDecimal riskScore;
        private RiskLevel riskLevel;
        private String riskReason;
        private List<String> primaryRiskFactors;
        private List<String> mitigationRecommendations;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RiskMatrixDto {
        private long totalServers;
        private long lowRiskCount;
        private long mediumRiskCount;
        private long highRiskCount;
        private long criticalRiskCount;
        private List<ServerRiskDto> highAndCriticalRiskServers;
        private Map<String, Integer> commonRiskFactorFrequency;
    }
}
