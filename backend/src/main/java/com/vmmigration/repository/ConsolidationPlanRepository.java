package com.vmmigration.repository;

import com.vmmigration.entity.ConsolidationPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ConsolidationPlanRepository extends JpaRepository<ConsolidationPlan, Long> {
    Optional<ConsolidationPlan> findTopByOrderByCreatedAtDesc();
}
