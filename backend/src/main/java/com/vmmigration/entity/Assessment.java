package com.vmmigration.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "assessments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Assessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "server_id", nullable = false, unique = true)
    private Server server;

    @Column(name = "migration_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal migrationScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Classification classification;

    @Column(name = "risk_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal riskScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", nullable = false, length = 20)
    private RiskLevel riskLevel;

    @Column(name = "priority_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal priorityScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "migration_priority", nullable = false, length = 20)
    private MigrationPriority migrationPriority;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "assessed_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime assessedAt;

    @PrePersist
    @PreUpdate
    protected void onSave() {
        if (assessedAt == null) {
            assessedAt = OffsetDateTime.now();
        }
    }
}
