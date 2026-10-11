package com.vmmigration.controller;

import com.vmmigration.dto.PerformanceDtos.*;
import com.vmmigration.service.PerformanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/performance")
@RequiredArgsConstructor
@Tag(name = "Performance Metrics", description = "Endpoints for telemetry timeseries, resource utilization, and monitoring logs")
public class PerformanceController {

    private final PerformanceService performanceService;

    @GetMapping("/{serverId}")
    @Operation(summary = "Get historical utilization telemetry and averages for a server")
    public ResponseEntity<ServerTelemetryDto> getServerTelemetry(@PathVariable Long serverId) {
        return ResponseEntity.ok(performanceService.getServerTelemetry(serverId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Ingest a new performance metric snapshot for a server (Admin only)")
    public ResponseEntity<PerformanceMetricDto> addMetric(@Valid @RequestBody PerformanceMetricCreateRequest request) {
        PerformanceMetricDto created = performanceService.addMetric(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
