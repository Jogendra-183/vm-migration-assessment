package com.vmmigration.mapper;

import com.vmmigration.dto.WaveDtos;
import com.vmmigration.entity.MigrationWave;
import com.vmmigration.entity.MigrationWaveServer;
import org.springframework.stereotype.Component;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class MigrationWaveMapper {

    public WaveDtos.MigrationWaveDto toDto(MigrationWave wave) {
        if (wave == null) {
            return null;
        }

        List<WaveDtos.MigrationWaveServerDto> serverDtos = wave.getWaveServers() != null
                ? wave.getWaveServers().stream().map(this::toServerDto).collect(Collectors.toList())
                : Collections.emptyList();

        return WaveDtos.MigrationWaveDto.builder()
                .id(wave.getId())
                .waveNumber(wave.getWaveNumber())
                .waveName(wave.getWaveName())
                .description(wave.getDescription())
                .status(wave.getStatus())
                .plannedDate(wave.getPlannedDate())
                .serverCount(serverDtos.size())
                .servers(serverDtos)
                .build();
    }

    public WaveDtos.MigrationWaveServerDto toServerDto(MigrationWaveServer mws) {
        if (mws == null) {
            return null;
        }

        WaveDtos.MigrationWaveServerDto.MigrationWaveServerDtoBuilder builder = WaveDtos.MigrationWaveServerDto.builder()
                .id(mws.getId())
                .waveId(mws.getWave() != null ? mws.getWave().getId() : null)
                .waveNumber(mws.getWave() != null ? mws.getWave().getWaveNumber() : null)
                .waveName(mws.getWave() != null ? mws.getWave().getWaveName() : null)
                .serverId(mws.getServer() != null ? mws.getServer().getId() : null)
                .serverName(mws.getServer() != null ? mws.getServer().getServerName() : null)
                .applicationName(mws.getServer() != null ? mws.getServer().getApplicationName() : null)
                .assignedAt(mws.getAssignedAt())
                .notes(mws.getNotes());

        if (mws.getServer() != null && mws.getServer().getAssessment() != null) {
            builder.classification(mws.getServer().getAssessment().getClassification())
                   .riskLevel(mws.getServer().getAssessment().getRiskLevel())
                   .priority(mws.getServer().getAssessment().getMigrationPriority());
        }

        return builder.build();
    }
}
