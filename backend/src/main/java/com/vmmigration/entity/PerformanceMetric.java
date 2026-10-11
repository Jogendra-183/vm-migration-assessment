package com.vmmigration.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "performance_metrics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerformanceMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "server_id", nullable = false)
    private Server server;

    @Column(name = "timestamp", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime timestamp;

    @Column(name = "cpu_utilization", nullable = false, precision = 5, scale = 2)
    private BigDecimal cpuUtilization;

    @Column(name = "ram_utilization", nullable = false, precision = 5, scale = 2)
    private BigDecimal ramUtilization;

    @Column(name = "storage_utilization", nullable = false, precision = 5, scale = 2)
    private BigDecimal storageUtilization;

    @Column(name = "network_utilization", nullable = false, precision = 5, scale = 2)
    private BigDecimal networkUtilization;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = OffsetDateTime.now();
        }
    }
}
