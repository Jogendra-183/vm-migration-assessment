package com.vmmigration.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "vm_recommendations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VmRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "server_id", nullable = false, unique = true)
    private Server server;

    @Column(name = "recommended_vcpu", nullable = false)
    private Integer recommendedVcpu;

    @Column(name = "recommended_ram_gb", nullable = false)
    private Integer recommendedRamGb;

    @Column(name = "recommended_storage_gb", nullable = false)
    private Integer recommendedStorageGb;

    @Column(name = "recommended_network_gbps", nullable = false, precision = 5, scale = 2)
    private BigDecimal recommendedNetworkGbps;

    @Column(name = "safety_margin", nullable = false, precision = 5, scale = 2)
    private BigDecimal safetyMargin;

    @Column(name = "estimated_cpu_utilization", nullable = false, precision = 5, scale = 2)
    private BigDecimal estimatedCpuUtilization;

    @Column(name = "estimated_ram_utilization", nullable = false, precision = 5, scale = 2)
    private BigDecimal estimatedRamUtilization;

    @Column(name = "recommendation_reason", nullable = false, columnDefinition = "TEXT")
    private String recommendationReason;
}
