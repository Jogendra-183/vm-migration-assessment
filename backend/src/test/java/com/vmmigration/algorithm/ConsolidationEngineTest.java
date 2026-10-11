package com.vmmigration.algorithm;

import com.vmmigration.dto.ConsolidationDtos.ConsolidationPlanDto;
import com.vmmigration.entity.*;
import com.vmmigration.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ConsolidationEngineTest {

    @Mock
    private ServerRepository serverRepository;
    @Mock
    private ConsolidationPlanRepository consolidationPlanRepository;
    @Mock
    private SystemSettingRepository systemSettingRepository;

    @InjectMocks
    private ConsolidationEngine consolidationEngine;

    @BeforeEach
    void setUp() {
        lenient().when(systemSettingRepository.findBySettingKey(anyString())).thenReturn(Optional.empty());
        lenient().when(consolidationPlanRepository.save(any(ConsolidationPlan.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void testConsolidationBinPacking() {
        List<Server> mockServers = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            mockServers.add(Server.builder()
                    .id((long) i)
                    .serverName("SERVER-" + i)
                    .cpuCores(16)
                    .totalRamGb(64)
                    .totalStorageGb(1000)
                    .build());
        }

        lenient().when(serverRepository.findAll()).thenReturn(mockServers);

        ConsolidationPlanDto plan = consolidationEngine.calculateConsolidation(64, 256, 10240);

        assertNotNull(plan);
        assertEquals(10, plan.getTotalPhysicalServers());
        assertTrue(plan.getVirtualizationHostsRequired() <= 4, "Should pack 10 servers into fewer hypervisor hosts");
        assertTrue(plan.getConsolidationRatio().doubleValue() >= 2.0);
    }
}
