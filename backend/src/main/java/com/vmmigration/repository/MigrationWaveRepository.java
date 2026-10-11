package com.vmmigration.repository;

import com.vmmigration.entity.MigrationWave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MigrationWaveRepository extends JpaRepository<MigrationWave, Long> {
    Optional<MigrationWave> findByWaveNumber(Integer waveNumber);
    List<MigrationWave> findAllByOrderByWaveNumberAsc();
}
