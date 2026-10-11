package com.vmmigration.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "cloud_vms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CloudVm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_server_id")
    private Server sourceServer;

    @Column(name = "instance_name", nullable = false, unique = true, length = 100)
    private String instanceName;

    @Column(name = "gcp_instance_id", length = 100)
    private String gcpInstanceId;

    @Column(name = "project_id", nullable = false, length = 100)
    private String projectId;

    @Column(name = "zone", nullable = false, length = 50)
    private String zone;

    @Column(name = "machine_type", nullable = false, length = 50)
    private String machineType;

    @Column(name = "vcpu", nullable = false)
    private Integer vcpu;

    @Column(name = "ram_gb", nullable = false, precision = 6, scale = 2)
    private BigDecimal ramGb;

    @Column(name = "boot_disk_size_gb", nullable = false)
    private Integer bootDiskSizeGb;

    @Column(name = "boot_disk_type", nullable = false, length = 50)
    private String bootDiskType;

    @Column(name = "boot_image", length = 200)
    private String bootImage;

    @Column(name = "vpc_network", nullable = false, length = 100)
    private String vpcNetwork;

    @Column(name = "subnet", length = 100)
    private String subnet;

    @Column(name = "internal_ip", length = 50)
    private String internalIp;

    @Column(name = "external_ip", length = 50)
    private String externalIp;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private CloudVmStatus status;

    @Column(name = "last_sync_at")
    private OffsetDateTime lastSyncAt;

    @Column(name = "estimated_hourly_cost", precision = 10, scale = 4)
    private BigDecimal estimatedHourlyCost;

    @Column(name = "estimated_monthly_cost", precision = 10, scale = 2)
    private BigDecimal estimatedMonthlyCost;

    @Column(name = "cost_assumptions", columnDefinition = "TEXT")
    private String costAssumptions;

    @Column(name = "created_by", length = 50)
    private String createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
