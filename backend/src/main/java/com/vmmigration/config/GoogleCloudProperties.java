package com.vmmigration.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Data
@Configuration
@ConfigurationProperties(prefix = "app.gcp")
public class GoogleCloudProperties {
    private String projectId = "project-7a8d1679-ad3e-46db-bb2";
    private String defaultRegion = "us-central1";
    private String defaultZone = "us-central1-a";
    private String defaultNetwork = "default";
    private String defaultSubnet = "";
    private boolean mockMode = false;
    private int maxConcurrentVms = 5;
    private CostControlProperties costControl = new CostControlProperties();

    @Data
    public static class CostControlProperties {
        private boolean enforceSafetyLimits = true;
        private List<String> allowedMachineTypes = Arrays.asList(
                "e2-micro", "e2-small", "e2-medium", "e2-standard-2", "e2-standard-4", "n2-standard-2", "n2-standard-4"
        );
    }
}
