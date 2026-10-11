package com.vmmigration.service;

import com.vmmigration.config.GoogleCloudProperties;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class ComputeEngineServiceLiveHealthTest {

    @Test
    void testLiveGoogleCloudHealthCheck() {
        GoogleCloudProperties properties = new GoogleCloudProperties();
        properties.setProjectId("project-7a8d1679-ad3e-46db-bb2");
        properties.setDefaultZone("us-central1-a");
        properties.setMockMode(false);

        ComputeEngineService service = new ComputeEngineService(properties);

        Map<String, Object> health = service.checkHealth();
        System.out.println("Live GCP Health Check Result: " + health);

        assertNotNull(health);
        assertEquals("project-7a8d1679-ad3e-46db-bb2", health.get("projectId"));
        assertTrue((Boolean) health.get("connected"), "Should successfully connect via ADC to GCP Compute Engine API: " + health.get("message"));
        assertTrue((Boolean) health.get("apiEnabled"));
    }
}
