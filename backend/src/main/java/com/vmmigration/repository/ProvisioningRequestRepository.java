package com.vmmigration.repository;

import com.vmmigration.entity.ProvisioningRequest;
import com.vmmigration.entity.ProvisioningStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProvisioningRequestRepository extends JpaRepository<ProvisioningRequest, Long> {
    List<ProvisioningRequest> findAllByOrderByCreatedAtDesc();
    List<ProvisioningRequest> findAllByStatusOrderByCreatedAtDesc(ProvisioningStatus status);
    Optional<ProvisioningRequest> findByOperationId(String operationId);
    Optional<ProvisioningRequest> findTopBySourceServerIdOrderByCreatedAtDesc(Long sourceServerId);
    boolean existsBySourceServerIdAndStatusIn(Long sourceServerId, List<ProvisioningStatus> statuses);
}
