package com.vmmigration.mapper;

import com.vmmigration.dto.SettingsDtos;
import com.vmmigration.entity.SystemSetting;
import org.springframework.stereotype.Component;

@Component
public class SystemSettingMapper {

    public SettingsDtos.SystemSettingDto toDto(SystemSetting setting) {
        if (setting == null) {
            return null;
        }

        return SettingsDtos.SystemSettingDto.builder()
                .id(setting.getId())
                .settingKey(setting.getSettingKey())
                .settingValue(setting.getSettingValue())
                .category(setting.getCategory())
                .description(setting.getDescription())
                .build();
    }
}
