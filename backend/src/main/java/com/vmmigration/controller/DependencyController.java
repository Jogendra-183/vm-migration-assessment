package com.vmmigration.controller;

import com.vmmigration.dto.DependencyDtos.*;
import com.vmmigration.service.DependencyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/dependencies")
@RequiredArgsConstructor
@Tag(name = "Dependencies Mapping", description = "Endpoints for multi-tier server dependencies, connection graphs, and topological maps")
public class DependencyController {

    private final DependencyService dependencyService;

    @GetMapping
    @Operation(summary = "Get list of all server dependencies across infrastructure")
    public ResponseEntity<List<DependencyDto>> getAllDependencies() {
        return ResponseEntity.ok(dependencyService.getAllDependencies());
    }

    @GetMapping("/server/{serverId}")
    @Operation(summary = "Get all inbound and outbound dependencies for a specific server")
    public ResponseEntity<List<DependencyDto>> getDependenciesForServer(@PathVariable Long serverId) {
        return ResponseEntity.ok(dependencyService.getDependenciesForServer(serverId));
    }

    @GetMapping("/graph")
    @Operation(summary = "Get complete visual graph model (nodes & edges) for interactive dependency visualization")
    public ResponseEntity<DependencyGraphDto> getDependencyGraph() {
        return ResponseEntity.ok(dependencyService.getDependencyGraph());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a dependency relationship between two servers (Admin only)")
    public ResponseEntity<DependencyDto> createDependency(@Valid @RequestBody DependencyCreateRequest request) {
        DependencyDto created = dependencyService.createDependency(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a dependency link (Admin only)")
    public ResponseEntity<Void> deleteDependency(@PathVariable Long id) {
        dependencyService.deleteDependency(id);
        return ResponseEntity.noContent().build();
    }
}
