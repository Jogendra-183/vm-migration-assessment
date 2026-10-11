package com.vmmigration.repository;

import com.vmmigration.entity.CloudOperation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CloudOperationRepository extends JpaRepository<CloudOperation, Long> {
    Optional<CloudOperation> findByOperationId(String operationId);
    List<CloudOperation> findAllByOrderByCreatedAtDesc();
    List<CloudOperation> findAllByStatus(String status);
}
