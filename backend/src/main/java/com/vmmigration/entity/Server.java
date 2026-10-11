package com.vmmigration.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "servers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Server {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "server_name", nullable = false, unique = true, length = 100)
    private String serverName;

    @Column(nullable = false, length = 100)
    private String hostname;

    @Column(name = "ip_address", nullable = false, length = 45)
    private String ipAddress;

    @Column(name = "operating_system", nullable = false, length = 100)
    private String operatingSystem;

    @Column(name = "os_version", nullable = false, length = 50)
    private String osVersion;

    @Column(name = "cpu_model", nullable = false, length = 150)
    private String cpuModel;

    @Column(name = "cpu_cores", nullable = false)
    private Integer cpuCores;

    @Column(name = "total_ram_gb", nullable = false)
    private Integer totalRamGb;

    @Column(name = "total_storage_gb", nullable = false)
    private Integer totalStorageGb;

    @Column(name = "storage_type", nullable = false, length = 50)
    private String storageType;

    @Column(name = "network_bandwidth_gbps", nullable = false, precision = 5, scale = 2)
    private BigDecimal networkBandwidthGbps;

    @Column(name = "average_cpu_utilization", nullable = false, precision = 5, scale = 2)
    private BigDecimal averageCpuUtilization;

    @Column(name = "peak_cpu_utilization", nullable = false, precision = 5, scale = 2)
    private BigDecimal peakCpuUtilization;

    @Column(name = "average_ram_utilization", nullable = false, precision = 5, scale = 2)
    private BigDecimal averageRamUtilization;

    @Column(name = "peak_ram_utilization", nullable = false, precision = 5, scale = 2)
    private BigDecimal peakRamUtilization;

    @Column(name = "average_storage_utilization", nullable = false, precision = 5, scale = 2)
    private BigDecimal averageStorageUtilization;

    @Column(name = "average_network_utilization", nullable = false, precision = 5, scale = 2)
    private BigDecimal averageNetworkUtilization;

    @Column(name = "application_name", nullable = false, length = 150)
    private String applicationName;

    @Column(name = "application_type", nullable = false, length = 100)
    private String applicationType;

    @Column(name = "application_owner", nullable = false, length = 100)
    private String applicationOwner;

    @Enumerated(EnumType.STRING)
    @Column(name = "business_criticality", nullable = false, length = 20)
    private BusinessCriticality businessCriticality;

    @Enumerated(EnumType.STRING)
    @Column(name = "downtime_requirement", nullable = false, length = 20)
    private DowntimeRequirement downtimeRequirement;

    @Column(name = "hardware_dependency", nullable = false)
    private Boolean hardwareDependency;

    @Column(name = "virtualization_compatibility", nullable = false)
    private Boolean virtualizationCompatibility;

    @Column(name = "server_age_years", nullable = false, precision = 4, scale = 1)
    private BigDecimal serverAgeYears;

    @Column(name = "maintenance_status", nullable = false, length = 50)
    private String maintenanceStatus;

    @Column(name = "current_status", nullable = false, length = 50)
    private String currentStatus;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime updatedAt;

    @OneToOne(mappedBy = "server", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Assessment assessment;

    @OneToOne(mappedBy = "server", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private VmRecommendation vmRecommendation;

    @OneToMany(mappedBy = "server", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<PerformanceMetric> performanceMetrics = new ArrayList<>();

    @OneToMany(mappedBy = "sourceServer", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Dependency> outboundDependencies = new ArrayList<>();

    @OneToMany(mappedBy = "targetServer", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Dependency> inboundDependencies = new ArrayList<>();

    @OneToOne(mappedBy = "server", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private MigrationWaveServer waveAssignment;

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
        if (maintenanceStatus == null) {
            maintenanceStatus = "ACTIVE";
        }
        if (currentStatus == null) {
            currentStatus = "RUNNING";
        }
        if (networkBandwidthGbps == null) {
            networkBandwidthGbps = BigDecimal.valueOf(1.0);
        }
        if (serverAgeYears == null) {
            serverAgeYears = BigDecimal.valueOf(3.0);
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
