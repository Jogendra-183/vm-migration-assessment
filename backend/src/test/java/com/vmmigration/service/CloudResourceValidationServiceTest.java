package com.vmmigration.service;

import com.vmmigration.config.GoogleCloudProperties;
import com.vmmigration.entity.*;
import com.vmmigration.exception.BadRequestException;
import com.vmmigration.repository.CloudVmRepository;
import com.vmmigration.repository.ProvisioningRequestRepository;
import com.vmmigration.repository.ServerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CloudResourceValidationServiceTest {

    @Mock
    private ServerRepository serverRepository;

    @Mock
    private CloudVmRepository cloudVmRepository;

    @Mock
    private ProvisioningRequestRepository provisioningRequestRepository;

    private GoogleCloudProperties gcpProperties;
    private CloudResourceValidationService validationService;

    @BeforeEach
    void setUp() {
        gcpProperties = new GoogleCloudProperties();
        validationService = new CloudResourceValidationService(
                gcpProperties, serverRepository, cloudVmRepository, provisioningRequestRepository
        );
    }

    @Test
    void testValidateEligibleServer() {
        Server server = Server.builder()
                .id(1L)
                .serverName("APP-SRV-01")
                .hardwareDependency(false)
                .virtualizationCompatibility(true)
                .build();

        Assessment assessment = Assessment.builder()
                .classification(Classification.READY_TO_MIGRATE)
                .riskLevel(RiskLevel.LOW)
                .migrationScore(BigDecimal.valueOf(85.0))
                .build();
        server.setAssessment(assessment);

        when(provisioningRequestRepository.existsBySourceServerIdAndStatusIn(any(), any())).thenReturn(false);
        when(cloudVmRepository.findBySourceServerId(1L)).thenReturn(Optional.empty());
        when(cloudVmRepository.countByStatus(CloudVmStatus.RUNNING)).thenReturn(0L);
        when(cloudVmRepository.countByStatus(CloudVmStatus.PROVISIONING)).thenReturn(0L);

        CloudResourceValidationService.ValidationResult result = validationService.validateServerEligibility(server);

        assertTrue(result.eligible);
        assertTrue(result.blockingErrors.isEmpty());
    }

    @Test
    void testValidateRetireServerBlocked() {
        Server server = Server.builder()
                .id(2L)
                .serverName("LEGACY-SRV-02")
                .hardwareDependency(false)
                .virtualizationCompatibility(true)
                .build();

        Assessment assessment = Assessment.builder()
                .classification(Classification.RETIRE)
                .riskLevel(RiskLevel.LOW)
                .build();
        server.setAssessment(assessment);

        CloudResourceValidationService.ValidationResult result = validationService.validateServerEligibility(server);

        assertFalse(result.eligible);
        assertTrue(result.blockingErrors.stream().anyMatch(e -> e.contains("RETIRE")));
    }

    @Test
    void testValidateKeepPhysicalBlocked() {
        Server server = Server.builder()
                .id(3L)
                .serverName("BAREMETAL-SRV-03")
                .hardwareDependency(true)
                .virtualizationCompatibility(true)
                .build();

        Assessment assessment = Assessment.builder()
                .classification(Classification.KEEP_PHYSICAL)
                .riskLevel(RiskLevel.CRITICAL)
                .build();
        server.setAssessment(assessment);

        CloudResourceValidationService.ValidationResult result = validationService.validateServerEligibility(server);

        assertFalse(result.eligible);
        assertTrue(result.blockingErrors.stream().anyMatch(e -> e.contains("KEEP_PHYSICAL") || e.contains("hardware dependencies")));
    }

    @Test
    void testValidateMachineTypeSafetyList() {
        assertDoesNotThrow(() -> validationService.validateMachineType("e2-micro"));
        assertDoesNotThrow(() -> validationService.validateMachineType("e2-standard-4"));

        assertThrows(BadRequestException.class, () -> validationService.validateMachineType("m1-ultramem-160"));
    }
}
