package com.vmmigration.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "provisioning_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProvisioningRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_server_id", nullable = false)
    private Server sourceServer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_id")
    private Assessment assessment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recommendation_id")
    private VmRecommendation recommendation;

    @Column(name = "instance_name", nullable = false, length = 100)
    private String instanceName;

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

    @Column(name = "boot_image", nullable = false, length = 200)
    private String bootImage;

    @Column(name = "vpc_network", nullable = false, length = 100)
    private String vpcNetwork;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private ProvisioningStatus status;

    @Column(name = "requested_by", nullable = false, length = 50)
    private String requestedBy;

    @Column(name = "approved_by", length = 50)
    private String approvedBy;

    @Column(name = "approval_comment", columnDefinition = "TEXT")
    private String approvalComment;

    @Column(name = "approved_at")
    private OffsetDateTime approvedAt;

    @Column(name = "operation_id", length = 150)
    private String operationId;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "estimated_monthly_cost", precision = 10, scale = 2)
    private BigDecimal estimatedMonthlyCost;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
