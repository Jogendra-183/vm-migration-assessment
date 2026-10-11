package com.vmmigration.mapper;

import com.vmmigration.dto.PerformanceDtos;
import com.vmmigration.entity.PerformanceMetric;
import org.springframework.stereotype.Component;

@Component
public class PerformanceMetricMapper {

    public PerformanceDtos.PerformanceMetricDto toDto(PerformanceMetric metric) {
        if (metric == null) {
            return null;
        }

        return PerformanceDtos.PerformanceMetricDto.builder()
                .id(metric.getId())
                .serverId(metric.getServer() != null ? metric.getServer().getId() : null)
                .timestamp(metric.getTimestamp())
                .cpuUtilization(metric.getCpuUtilization())
                .ramUtilization(metric.getRamUtilization())
                .storageUtilization(metric.getStorageUtilization())
                .networkUtilization(metric.getNetworkUtilization())
                .build();
    }
}
