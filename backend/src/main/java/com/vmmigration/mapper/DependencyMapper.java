package com.vmmigration.mapper;

import com.vmmigration.dto.DependencyDtos;
import com.vmmigration.entity.Dependency;
import org.springframework.stereotype.Component;

@Component
public class DependencyMapper {

    public DependencyDtos.DependencyDto toDto(Dependency dependency) {
        if (dependency == null) {
            return null;
        }

        return DependencyDtos.DependencyDto.builder()
                .id(dependency.getId())
                .sourceServerId(dependency.getSourceServer() != null ? dependency.getSourceServer().getId() : null)
                .sourceServerName(dependency.getSourceServer() != null ? dependency.getSourceServer().getServerName() : null)
                .sourceApplicationName(dependency.getSourceServer() != null ? dependency.getSourceServer().getApplicationName() : null)
                .targetServerId(dependency.getTargetServer() != null ? dependency.getTargetServer().getId() : null)
                .targetServerName(dependency.getTargetServer() != null ? dependency.getTargetServer().getServerName() : null)
                .targetApplicationName(dependency.getTargetServer() != null ? dependency.getTargetServer().getApplicationName() : null)
                .dependencyType(dependency.getDependencyType())
                .criticality(dependency.getCriticality())
                .description(dependency.getDescription())
                .build();
    }
}
