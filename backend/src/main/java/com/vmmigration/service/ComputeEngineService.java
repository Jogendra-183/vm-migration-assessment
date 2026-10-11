package com.vmmigration.service;

import com.google.api.gax.core.FixedCredentialsProvider;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.compute.v1.*;
import com.vmmigration.config.GoogleCloudProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ComputeEngineService {

    private final GoogleCloudProperties gcpProperties;

    /**
     * Test connection to Google Cloud using Application Default Credentials (ADC).
     * This is a non-billable, read-only verification call.
     */
    public Map<String, Object> checkHealth() {
        Map<String, Object> status = new HashMap<>();
        String projectId = gcpProperties.getProjectId();
        status.put("projectId", projectId);
        status.put("defaultRegion", gcpProperties.getDefaultRegion());
        status.put("defaultZone", gcpProperties.getDefaultZone());
        status.put("mockMode", gcpProperties.isMockMode());

        if (gcpProperties.isMockMode()) {
            status.put("connected", true);
            status.put("apiEnabled", true);
            status.put("account", "mock-service-account@google.internal");
            status.put("message", "Google Cloud integration is operating in simulated mock mode.");
            return status;
        }

        try {
            GoogleCredentials credentials = getCredentials();
            credentials.refreshIfExpired();

            // Perform read-only API call: Query zone details
            try (ZonesClient zonesClient = createZonesClient(credentials)) {
                Zone zone = zonesClient.get(projectId, gcpProperties.getDefaultZone());
                status.put("connected", true);
                status.put("apiEnabled", true);
                status.put("zoneStatus", zone.getStatus());
                status.put("account", "Application Default Credentials (ADC)");
                status.put("message", "Successfully connected to Google Cloud Compute Engine API for project: " + projectId);
            }
        } catch (Exception e) {
            log.error("Google Cloud Compute health check failed: {}", e.getMessage());
            status.put("connected", false);
            status.put("apiEnabled", false);
            status.put("error", e.getMessage());
            status.put("message", "Failed to connect to Google Cloud Compute Engine API: " + e.getMessage());
        }

        return status;
    }

    /**
     * Lists accessible zones in the target project.
     */
    public List<String> listZones() {
        if (gcpProperties.isMockMode()) {
            return Arrays.asList("us-central1-a", "us-central1-b", "us-central1-c", "us-central1-f", "asia-south1-a", "asia-south1-b");
        }

        try {
            GoogleCredentials credentials = getCredentials();
            try (ZonesClient zonesClient = createZonesClient(credentials)) {
                List<String> zones = new ArrayList<>();
                for (Zone zone : zonesClient.list(gcpProperties.getProjectId()).iterateAll()) {
                    zones.add(zone.getName());
                }
                return zones;
            }
        } catch (Exception e) {
            log.warn("Could not retrieve zones from Google Cloud: {}. Returning default zones.", e.getMessage());
            return Arrays.asList("us-central1-a", "us-central1-b", "us-central1-c", "us-central1-f", "asia-south1-a", "asia-south1-b");
        }
    }

    /**
     * Create a virtual machine instance in Compute Engine asynchronously.
     */
    public Operation createInstance(String instanceName, String zone, String machineType,
                                   int diskSizeGb, String bootImage, String network) throws IOException {
        String projectId = gcpProperties.getProjectId();

        if (gcpProperties.isMockMode()) {
            log.info("[MOCK] Creating simulated VM instance: {} in zone {}", instanceName, zone);
            return Operation.newBuilder()
                    .setName("mock-op-create-" + UUID.randomUUID())
                    .setStatus(Operation.Status.RUNNING)
                    .setTargetLink("https://www.googleapis.com/compute/v1/projects/" + projectId + "/zones/" + zone + "/instances/" + instanceName)
                    .build();
        }

        GoogleCredentials credentials = getCredentials();
        try (InstancesClient instancesClient = createInstancesClient(credentials)) {
            // Machine type URI
            String machineTypeUri = String.format("zones/%s/machineTypes/%s", zone, machineType);

            // Default boot image if not specified: Debian 12
            String sourceImageUri = (bootImage != null && !bootImage.isBlank())
                    ? bootImage
                    : "projects/debian-cloud/global/images/family/debian-12";

            // Boot disk configuration
            AttachedDiskInitializeParams initParams = AttachedDiskInitializeParams.newBuilder()
                    .setDiskSizeGb(diskSizeGb)
                    .setSourceImage(sourceImageUri)
                    .setDiskType(String.format("zones/%s/diskTypes/pd-standard", zone))
                    .build();

            AttachedDisk bootDisk = AttachedDisk.newBuilder()
                    .setBoot(true)
                    .setAutoDelete(true)
                    .setInitializeParams(initParams)
                    .build();

            // Network interface configuration
            String networkUri = network.startsWith("projects/") || network.startsWith("global/")
                    ? network
                    : String.format("projects/%s/global/networks/%s", projectId, network);

            // Ephemeral public IP access config for test connectivity
            AccessConfig accessConfig = AccessConfig.newBuilder()
                    .setType(AccessConfig.Type.ONE_TO_ONE_NAT.name())
                    .setName("External NAT")
                    .build();

            NetworkInterface networkInterface = NetworkInterface.newBuilder()
                    .setNetwork(networkUri)
                    .addAccessConfigs(accessConfig)
                    .build();

            // Metadata & Labels identifying application management
            Instance instanceResource = Instance.newBuilder()
                    .setName(instanceName)
                    .setMachineType(machineTypeUri)
                    .addDisks(bootDisk)
                    .addNetworkInterfaces(networkInterface)
                    .putLabels("managed-by", "vmmigration-system")
                    .putLabels("environment", "test-migration")
                    .setDescription("Provisioned via Virtual Machine Migration Assessment & Planning System")
                    .build();

            InsertInstanceRequest request = InsertInstanceRequest.newBuilder()
                    .setProject(projectId)
                    .setZone(zone)
                    .setInstanceResource(instanceResource)
                    .build();

            log.info("Submitting Compute Engine instance creation request for {} in {}", instanceName, zone);
            return instancesClient.insertCallable().call(request);
        }
    }

    /**
     * Get actual status of an instance from Compute Engine.
     */
    public Optional<Instance> getInstance(String instanceName, String zone) {
        String projectId = gcpProperties.getProjectId();

        if (gcpProperties.isMockMode()) {
            return Optional.of(Instance.newBuilder()
                    .setName(instanceName)
                    .setStatus(Instance.Status.RUNNING.name())
                    .setId(Math.abs((long) instanceName.hashCode()))
                    .build());
        }

        try {
            GoogleCredentials credentials = getCredentials();
            try (InstancesClient instancesClient = createInstancesClient(credentials)) {
                GetInstanceRequest request = GetInstanceRequest.newBuilder()
                        .setProject(projectId)
                        .setZone(zone)
                        .setInstance(instanceName)
                        .build();
                return Optional.of(instancesClient.get(request));
            }
        } catch (Exception e) {
            log.warn("Could not retrieve instance {} from zone {}: {}", instanceName, zone, e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Start a stopped instance.
     */
    public Operation startInstance(String instanceName, String zone) throws IOException {
        String projectId = gcpProperties.getProjectId();

        if (gcpProperties.isMockMode()) {
            return Operation.newBuilder()
                    .setName("mock-op-start-" + UUID.randomUUID())
                    .setStatus(Operation.Status.RUNNING)
                    .build();
        }

        GoogleCredentials credentials = getCredentials();
        try (InstancesClient instancesClient = createInstancesClient(credentials)) {
            StartInstanceRequest request = StartInstanceRequest.newBuilder()
                    .setProject(projectId)
                    .setZone(zone)
                    .setInstance(instanceName)
                    .build();
            return instancesClient.startCallable().call(request);
        }
    }

    /**
     * Stop a running instance.
     */
    public Operation stopInstance(String instanceName, String zone) throws IOException {
        String projectId = gcpProperties.getProjectId();

        if (gcpProperties.isMockMode()) {
            return Operation.newBuilder()
                    .setName("mock-op-stop-" + UUID.randomUUID())
                    .setStatus(Operation.Status.RUNNING)
                    .build();
        }

        GoogleCredentials credentials = getCredentials();
        try (InstancesClient instancesClient = createInstancesClient(credentials)) {
            StopInstanceRequest request = StopInstanceRequest.newBuilder()
                    .setProject(projectId)
                    .setZone(zone)
                    .setInstance(instanceName)
                    .build();
            return instancesClient.stopCallable().call(request);
        }
    }

    /**
     * Delete an instance from Compute Engine.
     */
    public Operation deleteInstance(String instanceName, String zone) throws IOException {
        String projectId = gcpProperties.getProjectId();

        if (gcpProperties.isMockMode()) {
            return Operation.newBuilder()
                    .setName("mock-op-delete-" + UUID.randomUUID())
                    .setStatus(Operation.Status.RUNNING)
                    .build();
        }

        GoogleCredentials credentials = getCredentials();
        try (InstancesClient instancesClient = createInstancesClient(credentials)) {
            DeleteInstanceRequest request = DeleteInstanceRequest.newBuilder()
                    .setProject(projectId)
                    .setZone(zone)
                    .setInstance(instanceName)
                    .build();
            return instancesClient.deleteCallable().call(request);
        }
    }

    /**
     * Query status of an asynchronous ZoneOperation.
     */
    public Optional<Operation> getZoneOperation(String operationId, String zone) {
        String projectId = gcpProperties.getProjectId();

        if (gcpProperties.isMockMode()) {
            return Optional.of(Operation.newBuilder()
                    .setName(operationId)
                    .setStatus(Operation.Status.DONE)
                    .build());
        }

        try {
            GoogleCredentials credentials = getCredentials();
            try (ZoneOperationsClient opsClient = createZoneOperationsClient(credentials)) {
                GetZoneOperationRequest request = GetZoneOperationRequest.newBuilder()
                        .setProject(projectId)
                        .setZone(zone)
                        .setOperation(operationId)
                        .build();
                return Optional.of(opsClient.get(request));
            }
        } catch (Exception e) {
            log.warn("Could not query zone operation {} in {}: {}", operationId, zone, e.getMessage());
            return Optional.empty();
        }
    }

    private GoogleCredentials getCredentials() throws IOException {
        String jsonEnv = System.getenv("GCP_CREDENTIALS_JSON");
        if (jsonEnv != null && !jsonEnv.isBlank()) {
            byte[] bytes;
            if (jsonEnv.trim().startsWith("{")) {
                bytes = jsonEnv.getBytes(java.nio.charset.StandardCharsets.UTF_8);
            } else {
                bytes = Base64.getDecoder().decode(jsonEnv.trim());
            }
            return GoogleCredentials.fromStream(new java.io.ByteArrayInputStream(bytes));
        }
        return GoogleCredentials.getApplicationDefault();
    }

    private InstancesClient createInstancesClient(GoogleCredentials credentials) throws IOException {
        InstancesSettings settings = InstancesSettings.newBuilder()
                .setCredentialsProvider(FixedCredentialsProvider.create(credentials))
                .build();
        return InstancesClient.create(settings);
    }

    private ZonesClient createZonesClient(GoogleCredentials credentials) throws IOException {
        ZonesSettings settings = ZonesSettings.newBuilder()
                .setCredentialsProvider(FixedCredentialsProvider.create(credentials))
                .build();
        return ZonesClient.create(settings);
    }

    private ZoneOperationsClient createZoneOperationsClient(GoogleCredentials credentials) throws IOException {
        ZoneOperationsSettings settings = ZoneOperationsSettings.newBuilder()
                .setCredentialsProvider(FixedCredentialsProvider.create(credentials))
                .build();
        return ZoneOperationsClient.create(settings);
    }
}
