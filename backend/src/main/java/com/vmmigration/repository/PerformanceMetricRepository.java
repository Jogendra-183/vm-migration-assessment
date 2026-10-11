package com.vmmigration.repository;

import com.vmmigration.entity.PerformanceMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PerformanceMetricRepository extends JpaRepository<PerformanceMetric, Long> {
    List<PerformanceMetric> findByServerIdOrderByTimestampDesc(Long serverId);
    List<PerformanceMetric> findTop20ByServerIdOrderByTimestampAsc(Long serverId);
}
