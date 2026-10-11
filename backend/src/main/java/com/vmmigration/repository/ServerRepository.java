package com.vmmigration.repository;

import com.vmmigration.entity.BusinessCriticality;
import com.vmmigration.entity.Server;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ServerRepository extends JpaRepository<Server, Long> {
    Optional<Server> findByServerName(String serverName);
    boolean existsByServerName(String serverName);
    boolean existsByHostname(String hostname);
    boolean existsByIpAddress(String ipAddress);

    @Query("SELECT s FROM Server s WHERE " +
           "(CAST(:search AS string) IS NULL OR CAST(:search AS string) = '' OR " +
           "LOWER(s.serverName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
           "LOWER(s.hostname) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
           "LOWER(s.ipAddress) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
           "LOWER(s.operatingSystem) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
           "LOWER(s.applicationName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) AND " +
           "(:criticality IS NULL OR s.businessCriticality = :criticality) AND " +
           "(CAST(:os AS string) IS NULL OR CAST(:os AS string) = '' OR LOWER(s.operatingSystem) LIKE LOWER(CONCAT('%', CAST(:os AS string), '%'))) AND " +
           "(CAST(:status AS string) IS NULL OR CAST(:status AS string) = '' OR s.currentStatus = CAST(:status AS string))")
    Page<Server> searchServers(
            @Param("search") String search,
            @Param("criticality") BusinessCriticality criticality,
            @Param("os") String os,
            @Param("status") String status,
            Pageable pageable);

    @Query("SELECT DISTINCT s.operatingSystem FROM Server s")
    List<String> findDistinctOperatingSystems();

    @Query("SELECT DISTINCT s.applicationType FROM Server s")
    List<String> findDistinctApplicationTypes();
}
