package com.vmmigration.dto;

import com.vmmigration.entity.BusinessCriticality;
import com.vmmigration.entity.DowntimeRequirement;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.OffsetDateTime;

public class ApplicationDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ApplicationDto {
        private Long id;
        private String name;
        private String type;
        private String owner;
        private BusinessCriticality criticality;
        private DowntimeRequirement downtimeRequirement;
        private Boolean hardwareDependency;
        private Boolean virtualizationCompatible;
        private OffsetDateTime createdAt;
        private Long serverCount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ApplicationRequest {
        @NotBlank(message = "Application name is required")
        private String name;

        @NotBlank(message = "Application type is required")
        private String type;

        @NotBlank(message = "Owner is required")
        private String owner;

        @NotNull(message = "Criticality is required")
        private BusinessCriticality criticality;

        @NotNull(message = "Downtime requirement is required")
        private DowntimeRequirement downtimeRequirement;

        private Boolean hardwareDependency;
        private Boolean virtualizationCompatible;
    }
}
