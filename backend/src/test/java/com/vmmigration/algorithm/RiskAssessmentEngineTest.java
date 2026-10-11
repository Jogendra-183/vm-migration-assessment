package com.vmmigration.algorithm;

import com.vmmigration.dto.RiskDtos.ServerRiskDto;
import com.vmmigration.entity.BusinessCriticality;
import com.vmmigration.entity.DowntimeRequirement;
import com.vmmigration.entity.RiskLevel;
import com.vmmigration.entity.Server;
import com.vmmigration.repository.DependencyRepository;
import com.vmmigration.repository.SystemSettingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class RiskAssessmentEngineTest {

    @Mock
    private DependencyRepository dependencyRepository;

    @Mock
    private SystemSettingRepository systemSettingRepository;

    @InjectMocks
    private RiskAssessmentEngine riskEngine;

    @BeforeEach
    void setUp() {
        lenient().when(systemSettingRepository.findBySettingKey(anyString())).thenReturn(Optional.empty());
    }

    @Test
    void testEvaluateRisk_LowRiskServer() {
        Server server = Server.builder()
                .id(1L)
                .serverName("WEB-01")
                .applicationName("Web")
                .operatingSystem("Ubuntu Linux")
                .peakCpuUtilization(BigDecimal.valueOf(30.0))
                .peakRamUtilization(BigDecimal.valueOf(40.0))
                .businessCriticality(BusinessCriticality.LOW)
                .downtimeRequirement(DowntimeRequirement.FLEXIBLE)
                .hardwareDependency(false)
                .virtualizationCompatibility(true)
                .serverAgeYears(BigDecimal.valueOf(2.0))
                .build();

        lenient().when(dependencyRepository.countDependenciesForServer(1L)).thenReturn(0L);

        ServerRiskDto result = riskEngine.evaluateRisk(server);

        assertNotNull(result);
        assertEquals(RiskLevel.LOW, result.getRiskLevel());
        assertTrue(result.getRiskScore().doubleValue() <= 30.0);
    }

    @Test
    void testEvaluateRisk_CriticalRiskServer() {
        Server server = Server.builder()
                .id(2L)
                .serverName("PAY-HSM-01")
                .applicationName("Payment HSM")
                .operatingSystem("RHEL 8")
                .peakCpuUtilization(BigDecimal.valueOf(90.0))
                .peakRamUtilization(BigDecimal.valueOf(95.0))
                .businessCriticality(BusinessCriticality.CRITICAL)
                .downtimeRequirement(DowntimeRequirement.NONE)
                .hardwareDependency(true)
                .virtualizationCompatibility(false)
                .serverAgeYears(BigDecimal.valueOf(5.0))
                .build();

        lenient().when(dependencyRepository.countDependenciesForServer(2L)).thenReturn(5L);

        ServerRiskDto result = riskEngine.evaluateRisk(server);

        assertNotNull(result);
        assertEquals(RiskLevel.CRITICAL, result.getRiskLevel());
        assertTrue(result.getRiskScore().doubleValue() >= 80.0);
    }
}
