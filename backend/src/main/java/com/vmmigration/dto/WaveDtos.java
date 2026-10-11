package com.vmmigration.dto;

import com.vmmigration.entity.Classification;
import com.vmmigration.entity.MigrationPriority;
import com.vmmigration.entity.RiskLevel;
import com.vmmigration.entity.WaveStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public class WaveDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MigrationWaveDto {
        private Long id;
        private Integer waveNumber;
        private String waveName;
        private String description;
        private WaveStatus status;
        private LocalDate plannedDate;
        private int serverCount;
        private List<MigrationWaveServerDto> servers;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MigrationWaveServerDto {
        private Long id;
        private Long waveId;
        private Integer waveNumber;
        private String waveName;
        private Long serverId;
        private String serverName;
        private String applicationName;
        private Classification classification;
        private RiskLevel riskLevel;
        private MigrationPriority priority;
        private OffsetDateTime assignedAt;
        private String notes;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WaveAssignmentRequest {
        @NotNull(message = "Server ID is required")
        private Long serverId;

        @NotNull(message = "Wave ID is required")
        private Long waveId;

        private String notes;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WaveUpdateRequest {
        private String waveName;
        private String description;
        private WaveStatus status;
        private LocalDate plannedDate;
    }
}
