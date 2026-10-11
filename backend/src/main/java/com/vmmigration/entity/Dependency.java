package com.vmmigration.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dependencies", uniqueConstraints = {
    @UniqueConstraint(name = "unique_dependency", columnNames = {"source_server_id", "target_server_id", "dependency_type"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Dependency {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "source_server_id", nullable = false)
    private Server sourceServer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "target_server_id", nullable = false)
    private Server targetServer;

    @Enumerated(EnumType.STRING)
    @Column(name = "dependency_type", nullable = false, length = 50)
    private DependencyType dependencyType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BusinessCriticality criticality;

    @Column(columnDefinition = "TEXT")
    private String description;
}
