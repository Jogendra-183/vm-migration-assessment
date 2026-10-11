package com.vmmigration.algorithm;

import com.vmmigration.dto.AssessmentDtos.ScoreBreakdownDto;
import com.vmmigration.entity.BusinessCriticality;
import com.vmmigration.entity.DowntimeRequirement;
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
class MigrationScoringEngineTest {

    @Mock
    private SystemSettingRepository systemSettingRepository;

    @Mock
    private DependencyRepository dependencyRepository;

    @InjectMocks
    private MigrationScoringEngine scoringEngine;

    private Server testServer;

    @BeforeEach
    void setUp() {
        lenient().when(systemSettingRepository.findBySettingKey(anyString())).thenReturn(Optional.empty());

        testServer = Server.builder()
                .id(1L)
                .serverName("WEB-TEST-01")
                .hostname("web-test-01.local")
                .ipAddress("10.0.1.10")
                .operatingSystem("Ubuntu Linux")
                .osVersion("22.04 LTS")
                .cpuModel("Intel Xeon")
                .cpuCores(8)
                .totalRamGb(32)
                .totalStorageGb(500)
                .storageType("SSD")
                .networkBandwidthGbps(BigDecimal.valueOf(1.0))
                .averageCpuUtilization(BigDecimal.valueOf(20.0))
                .peakCpuUtilization(BigDecimal.valueOf(35.0))
                .averageRamUtilization(BigDecimal.valueOf(40.0))
                .peakRamUtilization(BigDecimal.valueOf(50.0))
                .averageStorageUtilization(BigDecimal.valueOf(45.0))
                .averageNetworkUtilization(BigDecimal.valueOf(15.0))
                .applicationName("Portal UI")
                .applicationType("WEB")
                .applicationOwner("DevOps")
                .businessCriticality(BusinessCriticality.LOW)
                .downtimeRequirement(DowntimeRequirement.FLEXIBLE)
                .hardwareDependency(false)
                .virtualizationCompatibility(true)
                .serverAgeYears(BigDecimal.valueOf(2.5))
                .build();
    }

    @Test
    void testCalculateScores_HighSuitability() {
        lenient().when(dependencyRepository.countDependenciesForServer(1L)).thenReturn(0L);

        ScoreBreakdownDto scores = scoringEngine.calculateScores(testServer);

        assertNotNull(scores);
        assertTrue(scores.getWeightedTotal().doubleValue() >= 80.0, "Expected high migration score for low utilization server");
        assertEquals(95.0, scores.getCpuScore().doubleValue());
        assertEquals(95.0, scores.getRamScore().doubleValue());
    }

    @Test
    void testCalculateScores_HardwareDependencyPenalty() {
        testServer.setHardwareDependency(true);
        lenient().when(dependencyRepository.countDependenciesForServer(1L)).thenReturn(0L);

        ScoreBreakdownDto scores = scoringEngine.calculateScores(testServer);

        assertNotNull(scores);
        assertEquals(10.0, scores.getCompatibilityScore().doubleValue());
    }
}
