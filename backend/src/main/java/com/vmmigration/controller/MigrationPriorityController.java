package com.vmmigration.controller;

import com.vmmigration.dto.PriorityDtos.*;
import com.vmmigration.service.MigrationPriorityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/migration-priority")
@RequiredArgsConstructor
@Tag(name = "Migration Priorities", description = "Endpoints for viewing migration priority rankings and performing administrator overrides")
public class MigrationPriorityController {

    private final MigrationPriorityService priorityService;

    @GetMapping
    @Operation(summary = "Get ranked list of servers by migration priority")
    public ResponseEntity<List<ServerPriorityDto>> getAllPriorities() {
        return ResponseEntity.ok(priorityService.getAllPriorities());
    }

    @PutMapping("/{serverId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Override migration priority for a specific server (Admin only)")
    public ResponseEntity<ServerPriorityDto> overridePriority(
            @PathVariable Long serverId,
            @Valid @RequestBody PriorityOverrideRequest request) {
        ServerPriorityDto updated = priorityService.overridePriority(serverId, request);
        return ResponseEntity.ok(updated);
    }
}
