package com.vmmigration.algorithm;

import com.vmmigration.entity.BusinessCriticality;
import com.vmmigration.entity.DowntimeRequirement;
import com.vmmigration.entity.Server;
import com.vmmigration.entity.VmRecommendation;
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
class VmSizingEngineTest {

    @Mock
    private SystemSettingRepository systemSettingRepository;

    @InjectMocks
    private VmSizingEngine sizingEngine;

    private Server testServer;

    @BeforeEach
    void setUp() {
        lenient().when(systemSettingRepository.findBySettingKey(anyString())).thenReturn(Optional.empty());

        testServer = Server.builder()
                .id(1L)
                .serverName("APP-TEST-01")
                .cpuCores(16)
                .totalRamGb(64)
                .totalStorageGb(1000)
                .networkBandwidthGbps(BigDecimal.valueOf(10.0))
                .averageCpuUtilization(BigDecimal.valueOf(20.0))
                .peakCpuUtilization(BigDecimal.valueOf(35.0))
                .averageRamUtilization(BigDecimal.valueOf(30.0))
                .peakRamUtilization(BigDecimal.valueOf(45.0))
                .averageStorageUtilization(BigDecimal.valueOf(40.0))
                .averageNetworkUtilization(BigDecimal.valueOf(10.0))
                .businessCriticality(BusinessCriticality.MEDIUM)
                .downtimeRequirement(DowntimeRequirement.MINIMAL)
                .hardwareDependency(false)
                .virtualizationCompatibility(true)
                .serverAgeYears(BigDecimal.valueOf(2.0))
                .build();
    }

    @Test
    void testRightSizingCalculation() {
        VmRecommendation rec = sizingEngine.calculateRecommendation(testServer);

        assertNotNull(rec);
        assertTrue(rec.getRecommendedVcpu() <= testServer.getCpuCores(), "Recommended vCPU should be right-sized");
        assertTrue(rec.getRecommendedRamGb() <= testServer.getTotalRamGb(), "Recommended RAM should be right-sized");
        assertTrue(rec.getEstimatedCpuUtilization().doubleValue() > testServer.getAverageCpuUtilization().doubleValue());
    }
}
