package com.vmmigration.report;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.vmmigration.dto.ReportDtos.ExecutiveSummaryReportDto;
import com.vmmigration.dto.ServerDtos.ServerDto;
import com.vmmigration.dto.WaveDtos.MigrationWaveDto;
import org.springframework.stereotype.Component;
import java.awt.Color;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Component
public class PdfReportGenerator {

    private static final Font TITLE_FONT = new Font(Font.HELVETICA, 20, Font.BOLD, new Color(30, 41, 59));
    private static final Font SECTION_FONT = new Font(Font.HELVETICA, 13, Font.BOLD, new Color(15, 23, 42));
    private static final Font SUBSECTION_FONT = new Font(Font.HELVETICA, 10, Font.BOLD, new Color(71, 85, 105));
    private static final Font BODY_FONT = new Font(Font.HELVETICA, 9, Font.NORMAL, new Color(51, 65, 85));
    private static final Font TABLE_HEADER_FONT = new Font(Font.HELVETICA, 8, Font.BOLD, Color.WHITE);
    private static final Font TABLE_BODY_FONT = new Font(Font.HELVETICA, 8, Font.NORMAL, new Color(30, 41, 59));

    public ByteArrayInputStream generateExecutivePdfReport(ExecutiveSummaryReportDto report) {
        Document document = new Document(PageSize.A4.rotate(), 30, 30, 35, 35);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Header Banner
            Paragraph title = new Paragraph("VIRTUAL MACHINE MIGRATION ASSESSMENT & PLANNING REPORT", TITLE_FONT);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Paragraph meta = new Paragraph("Infrastructure Analysis & Target Sizing Report • Generated: " +
                    report.getGeneratedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")), BODY_FONT);
            meta.setAlignment(Element.ALIGN_CENTER);
            meta.setSpacingAfter(15);
            document.add(meta);

            // Section 1: Executive Summary & KPI Metrics
            document.add(new Paragraph("1. Executive Summary & Infrastructure KPIs", SECTION_FONT));
            document.add(new Paragraph("This assessment report provides an exhaustive evaluation of " + report.getTotalPhysicalServers() +
                    " physical servers, identifying virtualization candidates, rightsized target VM capacities, risk factors, wave schedules, and consolidation economics.", BODY_FONT));

            PdfPTable kpiTable = new PdfPTable(6);
            kpiTable.setWidthPercentage(100);
            kpiTable.setSpacingBefore(10);
            kpiTable.setSpacingAfter(15);

            addKpiCell(kpiTable, "Total Servers", String.valueOf(report.getTotalPhysicalServers()), new Color(241, 245, 249));
            addKpiCell(kpiTable, "Ready to Migrate", String.valueOf(report.getReadyToMigrateCount()), new Color(209, 250, 229));
            addKpiCell(kpiTable, "Requires Optimization", String.valueOf(report.getRequiresOptimizationCount()), new Color(254, 243, 199));
            addKpiCell(kpiTable, "Keep Physical", String.valueOf(report.getKeepPhysicalCount()), new Color(254, 226, 226));
            addKpiCell(kpiTable, "Retire Workloads", String.valueOf(report.getRetireCount()), new Color(243, 244, 246));
            addKpiCell(kpiTable, "Consolidation Ratio", report.getConsolidationRatio() + ":1", new Color(224, 231, 255));
            document.add(kpiTable);

            // Section 2: Server Inventory & Assessment Summary
            document.add(new Paragraph("2. Server Workload Assessment & Right-Sizing Matrix", SECTION_FONT));
            
            PdfPTable table = new PdfPTable(9);
            table.setWidthPercentage(100);
            table.setSpacingBefore(8);
            table.setSpacingAfter(15);
            table.setWidths(new float[]{2.2f, 2.5f, 2.0f, 1.3f, 1.3f, 1.4f, 1.4f, 2.2f, 1.4f});

            addTableHeader(table, new String[]{"Server Name", "Application", "OS", "Phys Core", "Rec vCPU", "Phys RAM", "Rec RAM", "Classification", "Risk"});

            for (ServerDto s : report.getServersList()) {
                addTableCell(table, s.getServerName());
                addTableCell(table, s.getApplicationName());
                addTableCell(table, s.getOperatingSystem() + " " + (s.getOsVersion() != null ? s.getOsVersion() : ""));
                addTableCell(table, String.valueOf(s.getCpuCores()));
                addTableCell(table, String.valueOf(s.getRecommendedVcpu() != null ? s.getRecommendedVcpu() : "-"));
                addTableCell(table, s.getTotalRamGb() + " GB");
                addTableCell(table, (s.getRecommendedRamGb() != null ? s.getRecommendedRamGb() + " GB" : "-"));
                addTableCell(table, s.getClassification() != null ? s.getClassification().name() : "PENDING");
                addTableCell(table, s.getRiskLevel() != null ? s.getRiskLevel().name() : "LOW");
            }
            document.add(table);

            // Section 3: Migration Waves & Consolidation Plan
            document.add(new Paragraph("3. Migration Wave Execution Plan", SECTION_FONT));
            PdfPTable waveTable = new PdfPTable(5);
            waveTable.setWidthPercentage(100);
            waveTable.setSpacingBefore(8);
            waveTable.setSpacingAfter(15);
            waveTable.setWidths(new float[]{1.0f, 3.0f, 4.0f, 1.5f, 1.5f});

            addTableHeader(waveTable, new String[]{"Wave #", "Wave Name", "Scope & Description", "Servers", "Target Date"});
            for (MigrationWaveDto w : report.getWavesList()) {
                addTableCell(waveTable, "Wave " + w.getWaveNumber());
                addTableCell(waveTable, w.getWaveName());
                addTableCell(waveTable, w.getDescription());
                addTableCell(waveTable, String.valueOf(w.getServerCount()));
                addTableCell(waveTable, w.getPlannedDate() != null ? w.getPlannedDate().toString() : "TBD");
            }
            document.add(waveTable);

            // Section 4: Final Strategic Recommendations
            document.add(new Paragraph("4. Strategic Architectural Recommendations", SECTION_FONT));
            java.util.List<String> recs = report.getKeyRecommendations();
            com.lowagie.text.List pdfList = new com.lowagie.text.List(false, 15);
            for (String r : recs) {
                pdfList.add(new ListItem(r, BODY_FONT));
            }
            document.add(pdfList);

            document.close();
            return new ByteArrayInputStream(out.toByteArray());
        } catch (DocumentException e) {
            throw new RuntimeException("Error generating PDF report: " + e.getMessage(), e);
        }
    }

    private void addTableHeader(PdfPTable table, String[] headers) {
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, TABLE_HEADER_FONT));
            cell.setBackgroundColor(new Color(30, 41, 59));
            cell.setPadding(5);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);
        }
    }

    private void addTableCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "", TABLE_BODY_FONT));
        cell.setPadding(4);
        table.addCell(cell);
    }

    private void addKpiCell(PdfPTable table, String title, String value, Color bgColor) {
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(bgColor);
        cell.setPadding(8);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);

        Paragraph p1 = new Paragraph(title.toUpperCase(), SUBSECTION_FONT);
        p1.setAlignment(Element.ALIGN_CENTER);
        Paragraph p2 = new Paragraph(value, SECTION_FONT);
        p2.setAlignment(Element.ALIGN_CENTER);

        cell.addElement(p1);
        cell.addElement(p2);
        table.addCell(cell);
    }
}
