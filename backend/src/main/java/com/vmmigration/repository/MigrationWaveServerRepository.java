package com.vmmigration.repository;

import com.vmmigration.entity.MigrationWaveServer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MigrationWaveServerRepository extends JpaRepository<MigrationWaveServer, Long> {
    Optional<MigrationWaveServer> findByServerId(Long serverId);
    List<MigrationWaveServer> findByWaveId(Long waveId);
    void deleteByServerId(Long serverId);
}
