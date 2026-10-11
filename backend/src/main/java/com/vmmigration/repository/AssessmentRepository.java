package com.vmmigration.repository;

import com.vmmigration.entity.Assessment;
import com.vmmigration.entity.Classification;
import com.vmmigration.entity.RiskLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
    Optional<Assessment> findByServerId(Long serverId);
    List<Assessment> findByClassification(Classification classification);
    List<Assessment> findByRiskLevel(RiskLevel riskLevel);

    @Query("SELECT a.classification, COUNT(a) FROM Assessment a GROUP BY a.classification")
    List<Object[]> countByClassificationGroup();

    @Query("SELECT a.riskLevel, COUNT(a) FROM Assessment a GROUP BY a.riskLevel")
    List<Object[]> countByRiskLevelGroup();

    @Query("SELECT a.migrationPriority, COUNT(a) FROM Assessment a GROUP BY a.migrationPriority")
    List<Object[]> countByPriorityGroup();
}
