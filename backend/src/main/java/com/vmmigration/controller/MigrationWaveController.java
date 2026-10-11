package com.vmmigration.controller;

import com.vmmigration.dto.WaveDtos.*;
import com.vmmigration.service.MigrationWaveService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/migration-waves")
@RequiredArgsConstructor
@Tag(name = "Migration Waves", description = "Endpoints for wave schedule planning, grouping, and server assignments")
public class MigrationWaveController {

    private final MigrationWaveService waveService;

    @GetMapping
    @Operation(summary = "Get all migration waves with assigned server lists")
    public ResponseEntity<List<MigrationWaveDto>> getAllWaves() {
        return ResponseEntity.ok(waveService.getAllWaves());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get specific migration wave details")
    public ResponseEntity<MigrationWaveDto> getWaveById(@PathVariable Long id) {
        return ResponseEntity.ok(waveService.getWaveById(id));
    }

    @PostMapping("/assign")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Assign or move a server to a specific migration wave (Admin only)")
    public ResponseEntity<MigrationWaveServerDto> assignServerToWave(@Valid @RequestBody WaveAssignmentRequest request) {
        MigrationWaveServerDto result = waveService.assignServerToWave(request);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update wave metadata, description, status, or planned date (Admin only)")
    public ResponseEntity<MigrationWaveDto> updateWave(@PathVariable Long id, @RequestBody WaveUpdateRequest request) {
        MigrationWaveDto updated = waveService.updateWave(id, request);
        return ResponseEntity.ok(updated);
    }
}
