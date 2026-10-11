package com.vmmigration.repository;

import com.vmmigration.entity.CloudVm;
import com.vmmigration.entity.CloudVmStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CloudVmRepository extends JpaRepository<CloudVm, Long> {
    Optional<CloudVm> findByInstanceName(String instanceName);
    Optional<CloudVm> findBySourceServerId(Long sourceServerId);
    List<CloudVm> findAllByStatus(CloudVmStatus status);
    long countByStatus(CloudVmStatus status);
    boolean existsByInstanceName(String instanceName);
}
