package com.vmmigration.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "migration_waves")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MigrationWave {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "wave_number", nullable = false, unique = true)
    private Integer waveNumber;

    @Column(name = "wave_name", nullable = false, length = 100)
    private String waveName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private WaveStatus status;

    @Column(name = "planned_date")
    private LocalDate plannedDate;

    @OneToMany(mappedBy = "wave", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<MigrationWaveServer> waveServers = new ArrayList<>();
}
