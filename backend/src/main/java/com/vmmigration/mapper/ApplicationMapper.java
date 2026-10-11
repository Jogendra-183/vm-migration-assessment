package com.vmmigration.mapper;

import com.vmmigration.dto.ApplicationDtos;
import com.vmmigration.entity.Application;
import org.springframework.stereotype.Component;

@Component
public class ApplicationMapper {

    public ApplicationDtos.ApplicationDto toDto(Application app, Long serverCount) {
        if (app == null) {
            return null;
        }

        return ApplicationDtos.ApplicationDto.builder()
                .id(app.getId())
                .name(app.getName())
                .type(app.getType())
                .owner(app.getOwner())
                .criticality(app.getCriticality())
                .downtimeRequirement(app.getDowntimeRequirement())
                .hardwareDependency(app.getHardwareDependency())
                .virtualizationCompatible(app.getVirtualizationCompatible())
                .createdAt(app.getCreatedAt())
                .serverCount(serverCount != null ? serverCount : 0L)
                .build();
    }

    public Application toEntity(ApplicationDtos.ApplicationRequest request) {
        if (request == null) {
            return null;
        }

        return Application.builder()
                .name(request.getName())
                .type(request.getType())
                .owner(request.getOwner())
                .criticality(request.getCriticality())
                .downtimeRequirement(request.getDowntimeRequirement())
                .hardwareDependency(request.getHardwareDependency() != null ? request.getHardwareDependency() : false)
                .virtualizationCompatible(request.getVirtualizationCompatible() != null ? request.getVirtualizationCompatible() : true)
                .build();
    }
}
