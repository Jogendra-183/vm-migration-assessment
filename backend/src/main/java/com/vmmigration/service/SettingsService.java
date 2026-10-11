package com.vmmigration.service;

import com.vmmigration.dto.SettingsDtos.*;
import com.vmmigration.entity.SystemSetting;
import com.vmmigration.exception.ResourceNotFoundException;
import com.vmmigration.mapper.SystemSettingMapper;
import com.vmmigration.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private final SystemSettingRepository systemSettingRepository;
    private final SystemSettingMapper systemSettingMapper;

    public List<SystemSettingDto> getAllSettings() {
        return systemSettingRepository.findAll().stream()
                .map(systemSettingMapper::toDto)
                .collect(Collectors.toList());
    }

    public CategorizedSettingsDto getCategorizedSettings() {
        Map<String, List<SystemSettingDto>> map = systemSettingRepository.findAll().stream()
                .map(systemSettingMapper::toDto)
                .collect(Collectors.groupingBy(SystemSettingDto::getCategory));
        return CategorizedSettingsDto.builder().categorizedSettings(map).build();
    }

    @Transactional
    public SystemSettingDto updateSetting(SettingUpdateRequest request) {
        SystemSetting setting = systemSettingRepository.findBySettingKey(request.getSettingKey())
                .orElseThrow(() -> new ResourceNotFoundException("Setting key not found: " + request.getSettingKey()));

        setting.setSettingValue(request.getSettingValue());
        SystemSetting updated = systemSettingRepository.save(setting);
        return systemSettingMapper.toDto(updated);
    }

    @Transactional
    public List<SystemSettingDto> batchUpdateSettings(BatchSettingsUpdateRequest request) {
        if (request.getSettings() != null) {
            for (Map.Entry<String, String> entry : request.getSettings().entrySet()) {
                systemSettingRepository.findBySettingKey(entry.getKey()).ifPresent(setting -> {
                    setting.setSettingValue(entry.getValue());
                    systemSettingRepository.save(setting);
                });
            }
        }
        return getAllSettings();
    }
}
