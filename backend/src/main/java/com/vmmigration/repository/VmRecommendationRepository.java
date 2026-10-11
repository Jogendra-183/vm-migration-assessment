package com.vmmigration.repository;

import com.vmmigration.entity.VmRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface VmRecommendationRepository extends JpaRepository<VmRecommendation, Long> {
    Optional<VmRecommendation> findByServerId(Long serverId);

    @Query("SELECT SUM(v.recommendedVcpu), SUM(v.recommendedRamGb), SUM(v.recommendedStorageGb) FROM VmRecommendation v")
    Object[] getTotalVmResourceRequirements();
}
