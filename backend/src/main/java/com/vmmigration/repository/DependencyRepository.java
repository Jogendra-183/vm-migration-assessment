package com.vmmigration.repository;

import com.vmmigration.entity.Dependency;
import com.vmmigration.entity.DependencyType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DependencyRepository extends JpaRepository<Dependency, Long> {
    List<Dependency> findBySourceServerId(Long sourceServerId);
    List<Dependency> findByTargetServerId(Long targetServerId);

    @Query("SELECT d FROM Dependency d WHERE d.sourceServer.id = :serverId OR d.targetServer.id = :serverId")
    List<Dependency> findAllForServer(@Param("serverId") Long serverId);

    boolean existsBySourceServerIdAndTargetServerIdAndDependencyType(
            Long sourceServerId, Long targetServerId, DependencyType dependencyType);

    @Query("SELECT COUNT(d) FROM Dependency d WHERE d.sourceServer.id = :serverId OR d.targetServer.id = :serverId")
    long countDependenciesForServer(@Param("serverId") Long serverId);
}
