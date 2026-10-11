package com.vmmigration.service;

import com.vmmigration.algorithm.ConsolidationEngine;
import com.vmmigration.dto.ConsolidationDtos.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ConsolidationService {

    private final ConsolidationEngine consolidationEngine;

    public ConsolidationPlanDto getLatestConsolidationPlan() {
        return consolidationEngine.calculateConsolidation(null, null, null);
    }

    public ConsolidationPlanDto calculateCustomConsolidation(ConsolidationCustomRequest request) {
        return consolidationEngine.calculateConsolidation(
                request != null ? request.getCustomHostVcpu() : null,
                request != null ? request.getCustomHostRamGb() : null,
                request != null ? request.getCustomHostStorageGb() : null
        );
    }
}
