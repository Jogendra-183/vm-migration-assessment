package com.vmmigration.service;

import com.vmmigration.dto.WaveDtos.*;
import com.vmmigration.entity.*;
import com.vmmigration.exception.ResourceNotFoundException;
import com.vmmigration.mapper.MigrationWaveMapper;
import com.vmmigration.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MigrationWaveService {

    private final MigrationWaveRepository waveRepository;
    private final MigrationWaveServerRepository waveServerRepository;
    private final ServerRepository serverRepository;
    private final MigrationWaveMapper waveMapper;

    public List<MigrationWaveDto> getAllWaves() {
        return waveRepository.findAllByOrderByWaveNumberAsc().stream()
                .map(waveMapper::toDto)
                .collect(Collectors.toList());
    }

    public MigrationWaveDto getWaveById(Long id) {
        MigrationWave wave = waveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Wave not found with ID: " + id));
        return waveMapper.toDto(wave);
    }

    @Transactional
    public MigrationWaveServerDto assignServerToWave(WaveAssignmentRequest request) {
        Server server = serverRepository.findById(request.getServerId())
                .orElseThrow(() -> new ResourceNotFoundException("Server not found with ID: " + request.getServerId()));
        MigrationWave wave = waveRepository.findById(request.getWaveId())
                .orElseThrow(() -> new ResourceNotFoundException("Wave not found with ID: " + request.getWaveId()));

        MigrationWaveServer assignment = waveServerRepository.findByServerId(request.getServerId())
                .orElse(MigrationWaveServer.builder().server(server).build());

        assignment.setWave(wave);
        assignment.setNotes(request.getNotes() != null ? request.getNotes() : "Manually assigned to " + wave.getWaveName());

        MigrationWaveServer saved = waveServerRepository.save(assignment);
        return waveMapper.toServerDto(saved);
    }

    @Transactional
    public MigrationWaveDto updateWave(Long id, WaveUpdateRequest request) {
        MigrationWave wave = waveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Wave not found with ID: " + id));

        if (request.getWaveName() != null) wave.setWaveName(request.getWaveName());
        if (request.getDescription() != null) wave.setDescription(request.getDescription());
        if (request.getStatus() != null) wave.setStatus(request.getStatus());
        if (request.getPlannedDate() != null) wave.setPlannedDate(request.getPlannedDate());

        MigrationWave updated = waveRepository.save(wave);
        return waveMapper.toDto(updated);
    }
}
