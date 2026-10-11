package com.vmmigration.controller;

import com.vmmigration.dto.ReportDtos.ExecutiveSummaryReportDto;
import com.vmmigration.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports Generation", description = "Endpoints for generating Executive PDF reports and Detailed Excel workbooks")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/summary")
    @Operation(summary = "Get JSON payload of the comprehensive executive report")
    public ResponseEntity<ExecutiveSummaryReportDto> getReportSummary() {
        return ResponseEntity.ok(reportService.buildExecutiveSummaryReport());
    }

    @GetMapping("/pdf")
    @Operation(summary = "Download formatted Executive Assessment PDF Report")
    public ResponseEntity<Resource> downloadPdfReport() {
        InputStreamResource file = new InputStreamResource(reportService.generatePdfReport());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=vm_migration_assessment_report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(file);
    }

    @GetMapping("/excel")
    @Operation(summary = "Download multi-tab Detailed Assessment Excel Workbook (.xlsx)")
    public ResponseEntity<Resource> downloadExcelReport() {
        InputStreamResource file = new InputStreamResource(reportService.generateExcelReport());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=vm_migration_assessment_workbook.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(file);
    }
}
