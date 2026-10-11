package com.vmmigration.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "cloud_operations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CloudOperation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "operation_id", nullable = false, unique = true, length = 150)
    private String operationId;

    @Column(name = "operation_type", nullable = false, length = 50)
    private String operationType;

    @Column(name = "target_resource", nullable = false, length = 150)
    private String targetResource;

    @Column(name = "zone", nullable = false, length = 50)
    private String zone;

    @Column(name = "project_id", nullable = false, length = 100)
    private String projectId;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "http_status_code")
    private Integer httpStatusCode;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "initiated_by", length = 50)
    private String initiatedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;
}
