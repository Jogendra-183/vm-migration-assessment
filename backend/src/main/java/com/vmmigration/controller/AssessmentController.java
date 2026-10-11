package com.vmmigration.controller;

import com.vmmigration.dto.AssessmentDtos.*;
import com.vmmigration.service.AssessmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/assessment")
@RequiredArgsConstructor
@Tag(name = "Assessment Engine", description = "Endpoints for executing multi-factor migration evaluation, scoring, and classification")
public class AssessmentController {

    private final AssessmentService assessmentService;

    @PostMapping("/run")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Execute full assessment simulation across all inventory servers (Admin only)")
    public ResponseEntity<AssessmentRunResponse> runFullAssessment() {
        AssessmentRunResponse response = assessmentService.runFullAssessment();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/server/{serverId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Execute migration assessment and VM sizing for a single server (Admin only)")
    public ResponseEntity<AssessmentDto> assessSingleServer(@PathVariable Long serverId) {
        AssessmentDto response = assessmentService.assessSingleServer(serverId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Get list of all server assessment results with score breakdowns")
    public ResponseEntity<List<AssessmentDto>> getAllAssessments() {
        return ResponseEntity.ok(assessmentService.getAllAssessments());
    }

    @GetMapping("/summary")
    @Operation(summary = "Get high-level assessment summary and classification distributions")
    public ResponseEntity<AssessmentSummaryDto> getAssessmentSummary() {
        return ResponseEntity.ok(assessmentService.getAssessmentSummary());
    }

    @GetMapping("/{serverId}")
    @Operation(summary = "Get specific assessment and scoring breakdown for a server")
    public ResponseEntity<AssessmentDto> getAssessmentByServerId(@PathVariable Long serverId) {
        return ResponseEntity.ok(assessmentService.getAssessmentByServerId(serverId));
    }
}
