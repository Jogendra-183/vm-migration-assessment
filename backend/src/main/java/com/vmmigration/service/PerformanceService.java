package com.vmmigration.service;

import com.vmmigration.dto.PerformanceDtos.*;
import com.vmmigration.entity.PerformanceMetric;
import com.vmmigration.entity.Server;
import com.vmmigration.exception.ResourceNotFoundException;
import com.vmmigration.mapper.PerformanceMetricMapper;
import com.vmmigration.repository.PerformanceMetricRepository;
import com.vmmigration.repository.ServerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PerformanceService {

    private final PerformanceMetricRepository performanceMetricRepository;
    private final ServerRepository serverRepository;
    private final PerformanceMetricMapper performanceMetricMapper;

    public ServerTelemetryDto getServerTelemetry(Long serverId) {
        Server server = serverRepository.findById(serverId)
                .orElseThrow(() -> new ResourceNotFoundException("Server not found with ID: " + serverId));

        List<PerformanceMetricDto> historical = performanceMetricRepository.findByServerIdOrderByTimestampDesc(serverId).stream()
                .limit(24)
                .map(performanceMetricMapper::toDto)
                .collect(Collectors.toList());

        return ServerTelemetryDto.builder()
                .serverId(server.getId())
                .serverName(server.getServerName())
                .currentAvgCpu(server.getAverageCpuUtilization())
                .currentPeakCpu(server.getPeakCpuUtilization())
                .currentAvgRam(server.getAverageRamUtilization())
                .currentPeakRam(server.getPeakRamUtilization())
                .currentAvgStorage(server.getAverageStorageUtilization())
                .currentAvgNetwork(server.getAverageNetworkUtilization())
                .historicalMetrics(historical)
                .build();
    }

    @Transactional
    public PerformanceMetricDto addMetric(PerformanceMetricCreateRequest request) {
        Server server = serverRepository.findById(request.getServerId())
                .orElseThrow(() -> new ResourceNotFoundException("Server not found with ID: " + request.getServerId()));

        PerformanceMetric metric = PerformanceMetric.builder()
                .server(server)
                .timestamp(OffsetDateTime.now())
                .cpuUtilization(request.getCpuUtilization())
                .ramUtilization(request.getRamUtilization())
                .storageUtilization(request.getStorageUtilization())
                .networkUtilization(request.getNetworkUtilization())
                .build();

        PerformanceMetric saved = performanceMetricRepository.save(metric);
        return performanceMetricMapper.toDto(saved);
    }
}
