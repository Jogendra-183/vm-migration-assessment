package com.vmmigration.controller;

import com.vmmigration.dto.PagedResponse;
import com.vmmigration.dto.ServerDtos.*;
import com.vmmigration.entity.BusinessCriticality;
import com.vmmigration.service.ServerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/servers")
@RequiredArgsConstructor
@Tag(name = "Server Inventory", description = "Endpoints for managing the physical servers inventory, telemetry metrics, and CSV import/export")
public class ServerController {

    private final ServerService serverService;

    @GetMapping
    @Operation(summary = "Get paginated, searchable, and filtered list of physical servers")
    public ResponseEntity<PagedResponse<ServerDto>> getAllServers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BusinessCriticality criticality,
            @RequestParam(required = false) String os,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<ServerDto> response = serverService.getAllServers(search, criticality, os, status, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    @Operation(summary = "Get complete list of all servers without pagination")
    public ResponseEntity<List<ServerDto>> getAllServersList() {
        return ResponseEntity.ok(serverService.getAllServersList());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get server details by ID")
    public ResponseEntity<ServerDto> getServerById(@PathVariable Long id) {
        return ResponseEntity.ok(serverService.getServerById(id));
    }

    @GetMapping("/{id}/detail")
    @Operation(summary = "Get comprehensive 360-degree server detail breakdown (specs, telemetry, deps, scoring, VM)")
    public ResponseEntity<ServerDetailDto> getServerDetail(@PathVariable Long id) {
        return ResponseEntity.ok(serverService.getServerDetail(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Add a new server to inventory (Admin only)")
    public ResponseEntity<ServerDto> createServer(@Valid @RequestBody ServerCreateRequest request) {
        ServerDto created = serverService.createServer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update server attributes (Admin only)")
    public ResponseEntity<ServerDto> updateServer(@PathVariable Long id, @RequestBody ServerUpdateRequest request) {
        ServerDto updated = serverService.updateServer(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete server from inventory (Admin only)")
    public ResponseEntity<Void> deleteServer(@PathVariable Long id) {
        serverService.deleteServer(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Import servers via CSV file (Admin only)")
    public ResponseEntity<ImportSummaryDto> importCsv(@RequestParam("file") MultipartFile file) {
        ImportSummaryDto summary = serverService.importCsv(file);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/export")
    @Operation(summary = "Export server inventory to CSV format")
    public ResponseEntity<Resource> exportCsv() {
        InputStreamResource file = new InputStreamResource(serverService.exportCsv());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=server_inventory.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(file);
    }

    @GetMapping("/meta/operating-systems")
    @Operation(summary = "Get distinct operating systems in inventory")
    public ResponseEntity<List<String>> getDistinctOperatingSystems() {
        return ResponseEntity.ok(serverService.getDistinctOperatingSystems());
    }

    @GetMapping("/meta/application-types")
    @Operation(summary = "Get distinct application types in inventory")
    public ResponseEntity<List<String>> getDistinctApplicationTypes() {
        return ResponseEntity.ok(serverService.getDistinctApplicationTypes());
    }
}
