package com.vmmigration.report;

import com.vmmigration.dto.ReportDtos.ExecutiveSummaryReportDto;
import com.vmmigration.dto.ServerDtos.ServerDto;
import com.vmmigration.dto.WaveDtos.MigrationWaveDto;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Component
public class ExcelReportGenerator {

    public ByteArrayInputStream generateExcelReport(ExecutiveSummaryReportDto report) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            // Styles
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            CellStyle titleStyle = workbook.createCellStyle();
            Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 14);
            titleStyle.setFont(titleFont);

            // Sheet 1: Executive Summary
            Sheet sheet1 = workbook.createSheet("Executive Summary");
            int r1 = 0;
            Row titleRow = sheet1.createRow(r1++);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("VM Migration Assessment - Executive Summary");
            titleCell.setCellStyle(titleStyle);
            r1++;

            createSummaryRow(sheet1, r1++, "Total Physical Servers Assessed", String.valueOf(report.getTotalPhysicalServers()));
            createSummaryRow(sheet1, r1++, "Ready to Migrate", String.valueOf(report.getReadyToMigrateCount()));
            createSummaryRow(sheet1, r1++, "Requires Optimization", String.valueOf(report.getRequiresOptimizationCount()));
            createSummaryRow(sheet1, r1++, "Keep Physical", String.valueOf(report.getKeepPhysicalCount()));
            createSummaryRow(sheet1, r1++, "Retire Workloads", String.valueOf(report.getRetireCount()));
            createSummaryRow(sheet1, r1++, "Migration Readiness %", report.getMigrationReadinessPercent() + "%");
            createSummaryRow(sheet1, r1++, "Consolidation Ratio", report.getConsolidationRatio() + ":1");
            createSummaryRow(sheet1, r1++, "Target Virtualization Hosts Required", String.valueOf(report.getRequiredVirtualHosts()));
            createSummaryRow(sheet1, r1++, "Estimated Power & Cooling Savings", report.getEstimatedPowerSavingsPercent() + "%");

            // Sheet 2: Server Inventory & Sizing
            Sheet sheet2 = workbook.createSheet("Server Inventory & Sizing");
            String[] headers2 = {
                "Server Name", "Hostname", "IP Address", "OS", "Application", "Criticality",
                "Phys Cores", "Rec vCPU", "Phys RAM (GB)", "Rec RAM (GB)", "Phys Storage (GB)",
                "Classification", "Migration Score", "Risk Level", "Risk Score", "Priority", "Wave"
            };

            Row headerRow2 = sheet2.createRow(0);
            for (int i = 0; i < headers2.length; i++) {
                Cell cell = headerRow2.createCell(i);
                cell.setCellValue(headers2[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx2 = 1;
            for (ServerDto s : report.getServersList()) {
                Row row = sheet2.createRow(rowIdx2++);
                row.createCell(0).setCellValue(s.getServerName());
                row.createCell(1).setCellValue(s.getHostname());
                row.createCell(2).setCellValue(s.getIpAddress());
                row.createCell(3).setCellValue(s.getOperatingSystem() + " " + (s.getOsVersion() != null ? s.getOsVersion() : ""));
                row.createCell(4).setCellValue(s.getApplicationName());
                row.createCell(5).setCellValue(s.getBusinessCriticality() != null ? s.getBusinessCriticality().name() : "");
                row.createCell(6).setCellValue(s.getCpuCores());
                row.createCell(7).setCellValue(s.getRecommendedVcpu() != null ? s.getRecommendedVcpu() : 0);
                row.createCell(8).setCellValue(s.getTotalRamGb());
                row.createCell(9).setCellValue(s.getRecommendedRamGb() != null ? s.getRecommendedRamGb() : 0);
                row.createCell(10).setCellValue(s.getTotalStorageGb());
                row.createCell(11).setCellValue(s.getClassification() != null ? s.getClassification().name() : "");
                row.createCell(12).setCellValue(s.getMigrationScore() != null ? s.getMigrationScore().doubleValue() : 0.0);
                row.createCell(13).setCellValue(s.getRiskLevel() != null ? s.getRiskLevel().name() : "");
                row.createCell(14).setCellValue(s.getRiskScore() != null ? s.getRiskScore().doubleValue() : 0.0);
                row.createCell(15).setCellValue(s.getMigrationPriority() != null ? s.getMigrationPriority().name() : "");
                row.createCell(16).setCellValue(s.getAssignedWaveNumber() != null ? "Wave " + s.getAssignedWaveNumber() : "-");
            }

            // Sheet 3: Migration Waves
            Sheet sheet3 = workbook.createSheet("Migration Waves");
            String[] headers3 = {"Wave #", "Wave Name", "Scope / Description", "Server Count", "Planned Date", "Status"};
            Row headerRow3 = sheet3.createRow(0);
            for (int i = 0; i < headers3.length; i++) {
                Cell cell = headerRow3.createCell(i);
                cell.setCellValue(headers3[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx3 = 1;
            for (MigrationWaveDto w : report.getWavesList()) {
                Row row = sheet3.createRow(rowIdx3++);
                row.createCell(0).setCellValue(w.getWaveNumber());
                row.createCell(1).setCellValue(w.getWaveName());
                row.createCell(2).setCellValue(w.getDescription());
                row.createCell(3).setCellValue(w.getServerCount());
                row.createCell(4).setCellValue(w.getPlannedDate() != null ? w.getPlannedDate().toString() : "TBD");
                row.createCell(5).setCellValue(w.getStatus() != null ? w.getStatus().name() : "");
            }

            // Auto-size columns for all sheets
            for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
                Sheet s = workbook.getSheetAt(i);
                for (int col = 0; col < 15; col++) {
                    s.autoSizeColumn(col);
                }
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel report: " + e.getMessage(), e);
        }
    }

    private void createSummaryRow(Sheet sheet, int rowNum, String key, String val) {
        Row row = sheet.createRow(rowNum);
        row.createCell(0).setCellValue(key);
        row.createCell(1).setCellValue(val);
    }
}
