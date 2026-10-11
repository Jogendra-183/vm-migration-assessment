package com.vmmigration.service;

import com.vmmigration.dto.CloudDtos.MachineTypeOptionDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CloudPricingServiceTest {

    private CloudPricingService pricingService;

    @BeforeEach
    void setUp() {
        pricingService = new CloudPricingService();
    }

    @Test
    void testRecommendMachineType() {
        assertEquals("e2-micro", pricingService.recommendMachineType(1, 1));
        assertEquals("e2-small", pricingService.recommendMachineType(2, 2));
        assertEquals("e2-medium", pricingService.recommendMachineType(2, 4));
        assertEquals("e2-standard-2", pricingService.recommendMachineType(2, 8));
        assertEquals("e2-standard-4", pricingService.recommendMachineType(4, 16));
        assertEquals("e2-standard-8", pricingService.recommendMachineType(8, 32));
    }

    @Test
    void testCalculateEstimate() {
        CloudPricingService.CostEstimate estimate = pricingService.calculateEstimate("e2-micro", 50);

        assertNotNull(estimate);
        assertTrue(estimate.hourlyUsd.compareTo(BigDecimal.ZERO) > 0);
        assertTrue(estimate.monthlyUsd.compareTo(BigDecimal.ZERO) > 0);
        assertTrue(estimate.monthlyInr.compareTo(estimate.monthlyUsd) > 0);
        assertTrue(estimate.assumptions.contains("us-central1"));
        assertTrue(estimate.assumptions.contains("pd-standard"));
        assertTrue(estimate.assumptions.contains("STOPPED"));
    }

    @Test
    void testGetAvailableMachineTypes() {
        List<MachineTypeOptionDto> types = pricingService.getAvailableMachineTypes();
        assertFalse(types.isEmpty());
        assertTrue(types.stream().anyMatch(t -> t.getName().equals("e2-micro")));
        assertTrue(types.stream().anyMatch(t -> t.getName().equals("e2-standard-2")));
    }
}
