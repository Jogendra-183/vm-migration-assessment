package com.vmmigration.controller;

import com.vmmigration.dto.VmDtos.*;
import com.vmmigration.service.VmRecommendationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/vm-recommendations")
@RequiredArgsConstructor
@Tag(name = "VM Right-Sizing", description = "Endpoints for recommended virtual machine sizing and post-migration utilization")
public class VmRecommendationController {

    private final VmRecommendationService vmRecommendationService;

    @GetMapping
    @Operation(summary = "Get list of all VM right-sizing recommendations")
    public ResponseEntity<List<VmRecommendationDto>> getAllRecommendations() {
        return ResponseEntity.ok(vmRecommendationService.getAllRecommendations());
    }

    @GetMapping("/{serverId}")
    @Operation(summary = "Get VM right-sizing recommendation for a specific server")
    public ResponseEntity<VmRecommendationDto> getRecommendationByServerId(@PathVariable Long serverId) {
        return ResponseEntity.ok(vmRecommendationService.getRecommendationByServerId(serverId));
    }

    @GetMapping("/summary")
    @Operation(summary = "Get aggregate resource savings and core/memory capacity reductions")
    public ResponseEntity<VmRecommendationSummaryDto> getSummary() {
        return ResponseEntity.ok(vmRecommendationService.getSummary());
    }
}
