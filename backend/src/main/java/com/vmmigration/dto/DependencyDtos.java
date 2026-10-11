package com.vmmigration.dto;

import com.vmmigration.entity.BusinessCriticality;
import com.vmmigration.entity.DependencyType;
import jakarta.validation.constraints.NotNull;
import lombok.*;

public class DependencyDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DependencyDto {
        private Long id;
        private Long sourceServerId;
        private String sourceServerName;
        private String sourceApplicationName;
        private Long targetServerId;
        private String targetServerName;
        private String targetApplicationName;
        private DependencyType dependencyType;
        private BusinessCriticality criticality;
        private String description;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DependencyCreateRequest {
        @NotNull(message = "Source server ID is required")
        private Long sourceServerId;

        @NotNull(message = "Target server ID is required")
        private Long targetServerId;

        @NotNull(message = "Dependency type is required")
        private DependencyType dependencyType;

        @NotNull(message = "Criticality is required")
        private BusinessCriticality criticality;

        private String description;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DependencyGraphDto {
        private java.util.List<GraphNodeDto> nodes;
        private java.util.List<GraphEdgeDto> edges;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GraphNodeDto {
        private String id;
        private String label;
        private String type;
        private String criticality;
        private String classification;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GraphEdgeDto {
        private String id;
        private String source;
        private String target;
        private String type;
        private String criticality;
        private String label;
    }
}
