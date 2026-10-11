package com.vmmigration.controller;

import com.vmmigration.dto.SettingsDtos.*;
import com.vmmigration.service.SettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@Tag(name = "System Settings", description = "Endpoints for configuring assessment algorithm weights, thresholds, and parameters")
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping
    @Operation(summary = "Get all configurable system settings")
    public ResponseEntity<List<SystemSettingDto>> getAllSettings() {
        return ResponseEntity.ok(settingsService.getAllSettings());
    }

    @GetMapping("/categorized")
    @Operation(summary = "Get system settings grouped by functional category")
    public ResponseEntity<CategorizedSettingsDto> getCategorizedSettings() {
        return ResponseEntity.ok(settingsService.getCategorizedSettings());
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a specific setting value (Admin only)")
    public ResponseEntity<SystemSettingDto> updateSetting(@Valid @RequestBody SettingUpdateRequest request) {
        return ResponseEntity.ok(settingsService.updateSetting(request));
    }

    @PutMapping("/batch")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Batch update multiple settings (Admin only)")
    public ResponseEntity<List<SystemSettingDto>> batchUpdateSettings(@RequestBody BatchSettingsUpdateRequest request) {
        return ResponseEntity.ok(settingsService.batchUpdateSettings(request));
    }
}
