package com.vmmigration.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.List;
import java.util.Map;

public class SettingsDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SystemSettingDto {
        private Long id;
        private String settingKey;
        private String settingValue;
        private String category;
        private String description;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SettingUpdateRequest {
        @NotBlank(message = "Setting key is required")
        private String settingKey;

        @NotBlank(message = "Setting value is required")
        private String settingValue;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BatchSettingsUpdateRequest {
        private Map<String, String> settings;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategorizedSettingsDto {
        private Map<String, List<SystemSettingDto>> categorizedSettings;
    }
}
