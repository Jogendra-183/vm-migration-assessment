package com.vmmigration.controller;

import com.vmmigration.dto.ConsolidationDtos.*;
import com.vmmigration.service.ConsolidationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/consolidation")
@RequiredArgsConstructor
@Tag(name = "Host Consolidation", description = "Endpoints for simulating virtual host bin packing and consolidation ratios")
public class ConsolidationController {

    private final ConsolidationService consolidationService;

    @GetMapping
    @Operation(summary = "Get current virtualization consolidation plan with host bin placements and hardware savings")
    public ResponseEntity<ConsolidationPlanDto> getLatestConsolidationPlan() {
        return ResponseEntity.ok(consolidationService.getLatestConsolidationPlan());
    }

    @PostMapping("/calculate")
    @Operation(summary = "Calculate consolidation plan using custom virtual host hardware specifications")
    public ResponseEntity<ConsolidationPlanDto> calculateCustomConsolidation(@RequestBody(required = false) ConsolidationCustomRequest request) {
        return ResponseEntity.ok(consolidationService.calculateCustomConsolidation(request));
    }
}
