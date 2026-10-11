package com.vmmigration.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "consolidation_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsolidationPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "total_physical_servers", nullable = false)
    private Integer totalPhysicalServers;

    @Column(name = "migratable_servers", nullable = false)
    private Integer migratableServers;

    @Column(name = "retired_servers", nullable = false)
    private Integer retiredServers;

    @Column(name = "physical_servers_remaining", nullable = false)
    private Integer physicalServersRemaining;

    @Column(name = "virtualization_hosts_required", nullable = false)
    private Integer virtualizationHostsRequired;

    @Column(name = "total_vcpu_required", nullable = false)
    private Integer totalVcpuRequired;

    @Column(name = "total_ram_required", nullable = false)
    private Integer totalRamRequired;

    @Column(name = "total_storage_required", nullable = false)
    private Integer totalStorageRequired;

    @Column(name = "consolidation_ratio", nullable = false, precision = 5, scale = 2)
    private BigDecimal consolidationRatio;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
    }
}
