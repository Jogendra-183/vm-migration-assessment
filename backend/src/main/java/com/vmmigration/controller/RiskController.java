package com.vmmigration.controller;

import com.vmmigration.dto.RiskDtos.*;
import com.vmmigration.service.RiskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/risks")
@RequiredArgsConstructor
@Tag(name = "Risk Assessment", description = "Endpoints for multi-factor risk analysis, risk matrix, and mitigations")
public class RiskController {

    private final RiskService riskService;

    @GetMapping
    @Operation(summary = "Get list of all server risk evaluations")
    public ResponseEntity<List<ServerRiskDto>> getAllServerRisks() {
        return ResponseEntity.ok(riskService.getAllServerRisks());
    }

    @GetMapping("/matrix")
    @Operation(summary = "Get high-level risk matrix with counts, common risk factor frequencies, and critical servers")
    public ResponseEntity<RiskMatrixDto> getRiskMatrix() {
        return ResponseEntity.ok(riskService.getRiskMatrix());
    }

    @GetMapping("/{serverId}")
    @Operation(summary = "Get risk analysis for a specific server")
    public ResponseEntity<ServerRiskDto> getServerRisk(@PathVariable Long serverId) {
        return ResponseEntity.ok(riskService.getServerRisk(serverId));
    }
}
