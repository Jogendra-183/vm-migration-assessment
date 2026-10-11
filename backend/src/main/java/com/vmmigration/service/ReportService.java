package com.vmmigration.service;

import com.vmmigration.dto.ConsolidationDtos.ConsolidationPlanDto;
import com.vmmigration.dto.ReportDtos.ExecutiveSummaryReportDto;
import com.vmmigration.dto.ServerDtos.ServerDto;
import com.vmmigration.dto.WaveDtos.MigrationWaveDto;
import com.vmmigration.entity.Classification;
import com.vmmigration.entity.RiskLevel;
import com.vmmigration.report.ExcelReportGenerator;
import com.vmmigration.report.PdfReportGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ServerService serverService;
    private final MigrationWaveService waveService;
    private final DependencyService dependencyService;
    private final ConsolidationService consolidationService;
    private final PdfReportGenerator pdfReportGenerator;
    private final ExcelReportGenerator excelReportGenerator;

    public ExecutiveSummaryReportDto buildExecutiveSummaryReport() {
        List<ServerDto> servers = serverService.getAllServersList();
        List<MigrationWaveDto> waves = waveService.getAllWaves();
        ConsolidationPlanDto consolidation = consolidationService.getLatestConsolidationPlan();

        int total = servers.size();
        int ready = (int) servers.stream().filter(s -> s.getClassification() == Classification.READY_TO_MIGRATE).count();
        int opt = (int) servers.stream().filter(s -> s.getClassification() == Classification.REQUIRES_OPTIMIZATION).count();
        int keep = (int) servers.stream().filter(s -> s.getClassification() == Classification.KEEP_PHYSICAL).count();
        int retire = (int) servers.stream().filter(s -> s.getClassification() == Classification.RETIRE).count();

        int low = (int) servers.stream().filter(s -> s.getRiskLevel() == RiskLevel.LOW).count();
        int med = (int) servers.stream().filter(s -> s.getRiskLevel() == RiskLevel.MEDIUM).count();
        int high = (int) servers.stream().filter(s -> s.getRiskLevel() == RiskLevel.HIGH).count();
        int crit = (int) servers.stream().filter(s -> s.getRiskLevel() == RiskLevel.CRITICAL).count();

        double readinessPct = total > 0 ? ((double) ready / total) * 100.0 : 0.0;

        List<String> keyRecs = new ArrayList<>();
        keyRecs.add("Execute Wave 1 pilot migrations immediately to build operational confidence and validate vMotion hypervisor networking.");
        keyRecs.add("Prioritize memory tuning and kernel parameter adjustments for " + opt + " workloads marked 'Requires Optimization'.");
        keyRecs.add("Decommission and archive " + retire + " obsolete servers to reclaim datacentre power, cooling, and rack footprint.");
        keyRecs.add("Retain " + keep + " mission-critical bare-metal servers on dedicated physical infrastructure to preserve hardware license dongles and low-latency PCIe access.");
        keyRecs.add("Procure " + consolidation.getVirtualizationHostsRequired() + " hypervisor hosts to achieve an enterprise consolidation ratio of " + consolidation.getConsolidationRatio() + ":1.");

        return ExecutiveSummaryReportDto.builder()
                .projectName("Enterprise " + total + "-Server Workload Virtualization Assessment")
                .generatedAt(OffsetDateTime.now())
                .totalPhysicalServers(total)
                .readyToMigrateCount(ready)
                .requiresOptimizationCount(opt)
                .keepPhysicalCount(keep)
                .retireCount(retire)
                .migrationReadinessPercent(BigDecimal.valueOf(readinessPct).setScale(1, RoundingMode.HALF_UP))
                .lowRiskCount(low)
                .mediumRiskCount(med)
                .highRiskCount(high)
                .criticalRiskCount(crit)
                .recommendedVmCount(consolidation.getMigratableServers())
                .requiredVirtualHosts(consolidation.getVirtualizationHostsRequired())
                .consolidationRatio(consolidation.getConsolidationRatio())
                .totalPhysicalCores(consolidation.getHardwareComparison() != null ? consolidation.getHardwareComparison().getBeforeTotalCores() : 0)
                .totalVirtualVcpu(consolidation.getTotalVcpuRequired())
                .totalPhysicalRamGb(consolidation.getHardwareComparison() != null ? consolidation.getHardwareComparison().getBeforeTotalRamGb() : 0)
                .totalVirtualRamGb(consolidation.getTotalRamRequired())
                .estimatedPowerSavingsPercent(consolidation.getHardwareComparison() != null ? consolidation.getHardwareComparison().getEstimatedPowerSavingsPercent() : BigDecimal.ZERO)
                .serversList(servers)
                .wavesList(waves)
                .dependenciesList(dependencyService.getAllDependencies())
                .keyRecommendations(keyRecs)
                .build();
    }

    public ByteArrayInputStream generatePdfReport() {
        ExecutiveSummaryReportDto reportDto = buildExecutiveSummaryReport();
        return pdfReportGenerator.generateExecutivePdfReport(reportDto);
    }

    public ByteArrayInputStream generateExcelReport() {
        ExecutiveSummaryReportDto reportDto = buildExecutiveSummaryReport();
        return excelReportGenerator.generateExcelReport(reportDto);
    }
}
