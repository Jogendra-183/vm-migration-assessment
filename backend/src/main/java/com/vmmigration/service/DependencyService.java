package com.vmmigration.service;

import com.vmmigration.dto.DependencyDtos.*;
import com.vmmigration.entity.*;
import com.vmmigration.exception.DuplicateResourceException;
import com.vmmigration.exception.ResourceNotFoundException;
import com.vmmigration.mapper.DependencyMapper;
import com.vmmigration.repository.DependencyRepository;
import com.vmmigration.repository.ServerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DependencyService {

    private final DependencyRepository dependencyRepository;
    private final ServerRepository serverRepository;
    private final DependencyMapper dependencyMapper;

    public List<DependencyDto> getAllDependencies() {
        return dependencyRepository.findAll().stream()
                .map(dependencyMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<DependencyDto> getDependenciesForServer(Long serverId) {
        return dependencyRepository.findAllForServer(serverId).stream()
                .map(dependencyMapper::toDto)
                .collect(Collectors.toList());
    }

    public DependencyGraphDto getDependencyGraph() {
        List<Server> servers = serverRepository.findAll();
        List<Dependency> dependencies = dependencyRepository.findAll();

        List<GraphNodeDto> nodes = servers.stream()
                .map(s -> GraphNodeDto.builder()
                        .id(String.valueOf(s.getId()))
                        .label(s.getServerName())
                        .type(s.getApplicationType())
                        .criticality(s.getBusinessCriticality().name())
                        .classification(s.getAssessment() != null ? s.getAssessment().getClassification().name() : "UNASSESSED")
                        .build())
                .collect(Collectors.toList());

        List<GraphEdgeDto> edges = dependencies.stream()
                .map(d -> GraphEdgeDto.builder()
                        .id("e-" + d.getId())
                        .source(String.valueOf(d.getSourceServer().getId()))
                        .target(String.valueOf(d.getTargetServer().getId()))
                        .type(d.getDependencyType().name())
                        .criticality(d.getCriticality().name())
                        .label(d.getDependencyType().name())
                        .build())
                .collect(Collectors.toList());

        return DependencyGraphDto.builder()
                .nodes(nodes)
                .edges(edges)
                .build();
    }

    @Transactional
    public DependencyDto createDependency(DependencyCreateRequest request) {
        if (dependencyRepository.existsBySourceServerIdAndTargetServerIdAndDependencyType(
                request.getSourceServerId(), request.getTargetServerId(), request.getDependencyType())) {
            throw new DuplicateResourceException("This dependency relationship already exists");
        }

        Server source = serverRepository.findById(request.getSourceServerId())
                .orElseThrow(() -> new ResourceNotFoundException("Source server not found with ID: " + request.getSourceServerId()));
        Server target = serverRepository.findById(request.getTargetServerId())
                .orElseThrow(() -> new ResourceNotFoundException("Target server not found with ID: " + request.getTargetServerId()));

        Dependency dependency = Dependency.builder()
                .sourceServer(source)
                .targetServer(target)
                .dependencyType(request.getDependencyType())
                .criticality(request.getCriticality())
                .description(request.getDescription())
                .build();

        Dependency saved = dependencyRepository.save(dependency);
        return dependencyMapper.toDto(saved);
    }

    @Transactional
    public void deleteDependency(Long id) {
        if (!dependencyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Dependency not found with ID: " + id);
        }
        dependencyRepository.deleteById(id);
    }
}
