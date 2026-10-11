package com.vmmigration.algorithm;

import com.vmmigration.entity.BusinessCriticality;
import com.vmmigration.entity.Classification;
import com.vmmigration.entity.MigrationPriority;
import com.vmmigration.entity.Server;
import com.vmmigration.repository.DependencyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
@RequiredArgsConstructor
public class MigrationPriorityEngine {

    private final DependencyRepository dependencyRepository;

    public static class PriorityResult {
        public final BigDecimal priorityScore;
        public final MigrationPriority priority;

        public PriorityResult(BigDecimal priorityScore, MigrationPriority priority) {
            this.priorityScore = priorityScore;
            this.priority = priority;
        }
    }

    public PriorityResult calculatePriority(Server server, BigDecimal migrationScore, BigDecimal riskScore, Classification classification) {
        // RETIRE and KEEP_PHYSICAL are handled
        if (classification == Classification.RETIRE) {
            return new PriorityResult(BigDecimal.valueOf(10.0), MigrationPriority.PRIORITY_4);
        }
        if (classification == Classification.KEEP_PHYSICAL) {
            return new PriorityResult(BigDecimal.valueOf(5.0), MigrationPriority.PRIORITY_4);
        }

        // Higher priority score = migrate earlier (Priority 1)
        // High migration score (+), Low risk (+), Low dependencies (+), Low-to-medium criticality (+)
        double score = 50.0;

        // Suitability factor
        score += (migrationScore.doubleValue() * 0.4);

        // Invert risk (lower risk = higher early priority)
        score += ((100.0 - riskScore.doubleValue()) * 0.3);

        // Dependency factor (independent services get higher early priority for quick wins)
        long depCount = dependencyRepository.countDependenciesForServer(server.getId());
        if (depCount == 0) {
            score += 15.0;
        } else if (depCount <= 2) {
            score += 8.0;
        } else {
            score -= 10.0;
        }

        // Criticality factor (pilot low criticality first, mission critical later)
        BusinessCriticality crit = server.getBusinessCriticality();
        if (crit == BusinessCriticality.LOW) {
            score += 10.0;
        } else if (crit == BusinessCriticality.MEDIUM) {
            score += 5.0;
        } else if (crit == BusinessCriticality.CRITICAL) {
            score -= 15.0;
        }

        score = Math.max(0.0, Math.min(100.0, score));
        BigDecimal finalPriorityScore = BigDecimal.valueOf(score).setScale(2, RoundingMode.HALF_UP);

        MigrationPriority priority;
        if (score >= 75.0) {
            priority = MigrationPriority.PRIORITY_1; // Quick wins & pilot candidates
        } else if (score >= 55.0) {
            priority = MigrationPriority.PRIORITY_2; // Standard core application tier
        } else if (score >= 35.0) {
            priority = MigrationPriority.PRIORITY_3; // Complex & multi-dependent tiers
        } else {
            priority = MigrationPriority.PRIORITY_4; // High risk, require optimization or deferred
        }

        return new PriorityResult(finalPriorityScore, priority);
    }
}
