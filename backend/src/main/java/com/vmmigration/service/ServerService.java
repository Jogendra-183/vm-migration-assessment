package com.vmmigration.service;

import com.vmmigration.algorithm.MigrationScoringEngine;
import com.vmmigration.dto.*;
import com.vmmigration.dto.ServerDtos.*;
import com.vmmigration.entity.*;
import com.vmmigration.exception.BadRequestException;
import com.vmmigration.exception.DuplicateResourceException;
import com.vmmigration.exception.ResourceNotFoundException;
import com.vmmigration.mapper.*;
import com.vmmigration.repository.*;
import com.vmmigration.util.CsvHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServerService {

    private final ServerRepository serverRepository;
    private final ApplicationRepository applicationRepository;
    private final DependencyRepository dependencyRepository;
    private final PerformanceMetricRepository performanceMetricRepository;
    private final ServerMapper serverMapper;
    private final AssessmentMapper assessmentMapper;
    private final VmRecommendationMapper vmRecommendationMapper;
    private final DependencyMapper dependencyMapper;
    private final PerformanceMetricMapper performanceMetricMapper;
    private final MigrationWaveMapper migrationWaveMapper;
    private final MigrationScoringEngine scoringEngine;

    public PagedResponse<ServerDto> getAllServers(String search, BusinessCriticality criticality, String os, String status, Pageable pageable) {
        Page<Server> serverPage = serverRepository.searchServers(search, criticality, os, status, pageable);
        List<ServerDto> dtos = serverPage.getContent().stream()
                .map(serverMapper::toDto)
                .collect(Collectors.toList());

        return PagedResponse.<ServerDto>builder()
                .content(dtos)
                .pageNumber(serverPage.getNumber())
                .pageSize(serverPage.getSize())
                .totalElements(serverPage.getTotalElements())
                .totalPages(serverPage.getTotalPages())
                .isLast(serverPage.isLast())
                .build();
    }

    public List<ServerDto> getAllServersList() {
        return serverRepository.findAll().stream()
                .map(serverMapper::toDto)
                .collect(Collectors.toList());
    }

    public ServerDto getServerById(Long id) {
        Server server = serverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Server not found with ID: " + id));
        return serverMapper.toDto(server);
    }

    public ServerDetailDto getServerDetail(Long id) {
        Server server = serverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Server not found with ID: " + id));

        ServerDto serverDto = serverMapper.toDto(server);
        AssessmentDtos.AssessmentDto assessmentDto = server.getAssessment() != null
                ? assessmentMapper.toDto(server.getAssessment()) : null;

        if (assessmentDto != null) {
            assessmentDto.setScoreBreakdown(scoringEngine.calculateScores(server));
        } else {
            AssessmentDtos.ScoreBreakdownDto scoreBreakdown = scoringEngine.calculateScores(server);
            assessmentDto = AssessmentDtos.AssessmentDto.builder()
                    .serverId(server.getId())
                    .serverName(server.getServerName())
                    .applicationName(server.getApplicationName())
                    .migrationScore(scoreBreakdown.getWeightedTotal())
                    .scoreBreakdown(scoreBreakdown)
                    .build();
        }

        VmDtos.VmRecommendationDto vmDto = server.getVmRecommendation() != null
                ? vmRecommendationMapper.toDto(server.getVmRecommendation()) : null;

        List<DependencyDtos.DependencyDto> dependencies = dependencyRepository.findAllForServer(id).stream()
                .map(dependencyMapper::toDto)
                .collect(Collectors.toList());

        List<PerformanceDtos.PerformanceMetricDto> metrics = performanceMetricRepository.findTop20ByServerIdOrderByTimestampAsc(id).stream()
                .map(performanceMetricMapper::toDto)
                .collect(Collectors.toList());

        WaveDtos.MigrationWaveServerDto waveDto = server.getWaveAssignment() != null
                ? migrationWaveMapper.toServerDto(server.getWaveAssignment()) : null;

        // Sizing comparison calculation
        SizingComparisonDto sizingComparison = null;
        if (vmDto != null) {
            double coreSavingsPct = ((double) (server.getCpuCores() - vmDto.getRecommendedVcpu()) / server.getCpuCores()) * 100.0;
            double ramSavingsPct = ((double) (server.getTotalRamGb() - vmDto.getRecommendedRamGb()) / server.getTotalRamGb()) * 100.0;

            sizingComparison = SizingComparisonDto.builder()
                    .physicalCores(server.getCpuCores())
                    .physicalRamGb(server.getTotalRamGb())
                    .physicalStorageGb(server.getTotalStorageGb())
                    .recommendedVcpu(vmDto.getRecommendedVcpu())
                    .recommendedRamGb(vmDto.getRecommendedRamGb())
                    .recommendedStorageGb(vmDto.getRecommendedStorageGb())
                    .cpuHeadroomSavingsPercent(BigDecimal.valueOf(Math.max(0, coreSavingsPct)).setScale(1, RoundingMode.HALF_UP))
                    .ramHeadroomSavingsPercent(BigDecimal.valueOf(Math.max(0, ramSavingsPct)).setScale(1, RoundingMode.HALF_UP))
                    .estimatedPostMigCpuUtil(vmDto.getEstimatedCpuUtilization())
                    .estimatedPostMigRamUtil(vmDto.getEstimatedRamUtilization())
                    .build();
        }

        return ServerDetailDto.builder()
                .server(serverDto)
                .assessment(assessmentDto)
                .vmRecommendation(vmDto)
                .dependencies(dependencies)
                .performanceMetrics(metrics)
                .waveAssignment(waveDto)
                .sizingComparison(sizingComparison)
                .build();
    }

    @Transactional
    public ServerDto createServer(ServerCreateRequest request) {
        if (serverRepository.existsByServerName(request.getServerName())) {
            throw new DuplicateResourceException("Server name already exists: " + request.getServerName());
        }
        if (serverRepository.existsByHostname(request.getHostname())) {
            throw new DuplicateResourceException("Hostname already exists: " + request.getHostname());
        }
        if (serverRepository.existsByIpAddress(request.getIpAddress())) {
            throw new DuplicateResourceException("IP address already exists: " + request.getIpAddress());
        }

        Server server = serverMapper.toEntity(request);
        Server savedServer = serverRepository.save(server);

        // Ensure application exists
        ensureApplicationExists(request);

        return serverMapper.toDto(savedServer);
    }

    @Transactional
    public ServerDto updateServer(Long id, ServerUpdateRequest request) {
        Server server = serverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Server not found with ID: " + id));

        serverMapper.updateEntityFromRequest(server, request);
        Server updatedServer = serverRepository.save(server);

        return serverMapper.toDto(updatedServer);
    }

    @Transactional
    public void deleteServer(Long id) {
        Server server = serverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Server not found with ID: " + id));

        // Safely remove any inbound or outbound dependencies
        List<Dependency> dependencies = dependencyRepository.findAllForServer(id);
        if (!dependencies.isEmpty()) {
            dependencyRepository.deleteAll(dependencies);
        }

        serverRepository.delete(server);
    }

    @Transactional
    public ImportSummaryDto importCsv(MultipartFile file) {
        if (!CsvHelper.hasCsvFormat(file)) {
            throw new BadRequestException("Please upload a valid CSV file");
        }

        int successCount = 0;
        int failCount = 0;
        List<String> errors = new ArrayList<>();

        try {
            List<ServerCreateRequest> requests = CsvHelper.csvToServers(file.getInputStream());
            for (ServerCreateRequest req : requests) {
                try {
                    if (serverRepository.existsByServerName(req.getServerName())) {
                        errors.add("Skipped: Server name " + req.getServerName() + " already exists");
                        failCount++;
                        continue;
                    }
                    Server entity = serverMapper.toEntity(req);
                    serverRepository.save(entity);
                    ensureApplicationExists(req);
                    successCount++;
                } catch (Exception ex) {
                    errors.add("Failed to import " + req.getServerName() + ": " + ex.getMessage());
                    failCount++;
                }
            }

            return ImportSummaryDto.builder()
                    .totalProcessed(requests.size())
                    .successfulImports(successCount)
                    .failedImports(failCount)
                    .errors(errors)
                    .build();

        } catch (IOException e) {
            throw new BadRequestException("Failed to parse CSV file: " + e.getMessage());
        }
    }

    public ByteArrayInputStream exportCsv() {
        List<ServerDto> servers = getAllServersList();
        return CsvHelper.serversToCsv(servers);
    }

    public List<String> getDistinctOperatingSystems() {
        return serverRepository.findDistinctOperatingSystems();
    }

    public List<String> getDistinctApplicationTypes() {
        return serverRepository.findDistinctApplicationTypes();
    }

    private void ensureApplicationExists(ServerCreateRequest req) {
        if (req.getApplicationName() != null && !applicationRepository.existsByName(req.getApplicationName())) {
            Application app = Application.builder()
                    .name(req.getApplicationName())
                    .type(req.getApplicationType())
                    .owner(req.getApplicationOwner())
                    .criticality(req.getBusinessCriticality())
                    .downtimeRequirement(req.getDowntimeRequirement())
                    .hardwareDependency(req.getHardwareDependency() != null ? req.getHardwareDependency() : false)
                    .virtualizationCompatible(req.getVirtualizationCompatibility() != null ? req.getVirtualizationCompatibility() : true)
                    .build();
            applicationRepository.save(app);
        }
    }
}
