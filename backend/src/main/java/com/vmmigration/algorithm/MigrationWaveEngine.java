package com.vmmigration.algorithm;

import com.vmmigration.entity.*;
import com.vmmigration.repository.MigrationWaveRepository;
import com.vmmigration.repository.MigrationWaveServerRepository;
import com.vmmigration.repository.ServerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Component
@RequiredArgsConstructor
public class MigrationWaveEngine {

    private final ServerRepository serverRepository;
    private final MigrationWaveRepository waveRepository;
    private final MigrationWaveServerRepository waveServerRepository;

    @Transactional
    public void generateWaves() {
        List<Server> allServers = serverRepository.findAll();
        List<MigrationWave> waves = waveRepository.findAllByOrderByWaveNumberAsc();

        if (waves.isEmpty()) {
            return;
        }

        Map<Integer, MigrationWave> waveMap = new HashMap<>();
        for (MigrationWave w : waves) {
            waveMap.put(w.getWaveNumber(), w);
        }

        // Clear existing wave server assignments immediately
        waveServerRepository.deleteAllInBatch();
        waveServerRepository.flush();

        List<MigrationWaveServer> assignments = new ArrayList<>();

        for (Server server : allServers) {
            Assessment assessment = server.getAssessment();
            if (assessment == null) {
                continue;
            }

            Classification classification = assessment.getClassification();
            RiskLevel riskLevel = assessment.getRiskLevel();
            BusinessCriticality criticality = server.getBusinessCriticality();

            // Servers marked RETIRE or KEEP_PHYSICAL are not assigned to active migration waves
            if (classification == Classification.RETIRE || classification == Classification.KEEP_PHYSICAL) {
                continue;
            }

            int targetWaveNumber;
            String note;

            if (classification == Classification.REQUIRES_OPTIMIZATION) {
                targetWaveNumber = waveMap.containsKey(4) ? 4 : 3;
                note = "Assigned to Wave " + targetWaveNumber + " pending OS/resource optimization actions.";
            } else if (riskLevel == RiskLevel.LOW && (criticality == BusinessCriticality.LOW || criticality == BusinessCriticality.MEDIUM)) {
                targetWaveNumber = 1;
                note = "Wave 1 Pilot candidate: Low risk and moderate business criticality.";
            } else if (riskLevel == RiskLevel.MEDIUM || criticality == BusinessCriticality.HIGH) {
                targetWaveNumber = 2;
                note = "Wave 2 Core tier: Standard application workload with acceptable risk parameters.";
            } else {
                targetWaveNumber = 3;
                note = "Wave 3 Mission Critical: Complex dependencies or high transactional volume.";
            }

            // Adjust based on dependencies if needed
            MigrationWave assignedWave = waveMap.getOrDefault(targetWaveNumber, waves.get(0));

            MigrationWaveServer mws = MigrationWaveServer.builder()
                    .wave(assignedWave)
                    .server(server)
                    .notes(note)
                    .build();

            assignments.add(mws);
        }

        waveServerRepository.saveAll(assignments);
    }
}
