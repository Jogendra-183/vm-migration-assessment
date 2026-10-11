package com.vmmigration.util;

import com.vmmigration.dto.ServerDtos.ServerCreateRequest;
import com.vmmigration.dto.ServerDtos.ServerDto;
import com.vmmigration.entity.BusinessCriticality;
import com.vmmigration.entity.DowntimeRequirement;
import org.apache.commons.csv.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.*;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

public class CsvHelper {

    public static final String TYPE = "text/csv";
    private static final String[] HEADERS = {
        "Server Name", "Hostname", "IP Address", "Operating System", "OS Version",
        "CPU Model", "CPU Cores", "Total RAM (GB)", "Total Storage (GB)", "Storage Type",
        "Network Bandwidth (Gbps)", "Avg CPU Util (%)", "Peak CPU Util (%)",
        "Avg RAM Util (%)", "Peak RAM Util (%)", "Avg Storage Util (%)", "Avg Network Util (%)",
        "Application Name", "Application Type", "Application Owner", "Business Criticality",
        "Downtime Requirement", "Hardware Dependency", "Virtualization Compatibility",
        "Server Age (Years)", "Maintenance Status", "Current Status"
    };

    public static boolean hasCsvFormat(MultipartFile file) {
        if (file == null) {
            return false;
        }
        String filename = file.getOriginalFilename();
        return TYPE.equalsIgnoreCase(file.getContentType()) || 
               (filename != null && filename.toLowerCase().endsWith(".csv"));
    }

    public static List<ServerCreateRequest> csvToServers(InputStream is) throws IOException {
        try (BufferedReader fileReader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
             CSVParser csvParser = new CSVParser(fileReader,
                     CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).setIgnoreHeaderCase(true).setTrim(true).build())) {

            List<ServerCreateRequest> serverList = new ArrayList<>();
            Iterable<CSVRecord> csvRecords = csvParser.getRecords();

            for (CSVRecord record : csvRecords) {
                ServerCreateRequest server = ServerCreateRequest.builder()
                        .serverName(record.get("Server Name"))
                        .hostname(record.get("Hostname"))
                        .ipAddress(record.get("IP Address"))
                        .operatingSystem(record.get("Operating System"))
                        .osVersion(record.get("OS Version"))
                        .cpuModel(record.get("CPU Model"))
                        .cpuCores(Integer.parseInt(record.get("CPU Cores")))
                        .totalRamGb(Integer.parseInt(record.get("Total RAM (GB)")))
                        .totalStorageGb(Integer.parseInt(record.get("Total Storage (GB)")))
                        .storageType(record.get("Storage Type"))
                        .networkBandwidthGbps(new BigDecimal(record.get("Network Bandwidth (Gbps)")))
                        .averageCpuUtilization(new BigDecimal(record.get("Avg CPU Util (%)")))
                        .peakCpuUtilization(new BigDecimal(record.get("Peak CPU Util (%)")))
                        .averageRamUtilization(new BigDecimal(record.get("Avg RAM Util (%)")))
                        .peakRamUtilization(new BigDecimal(record.get("Peak RAM Util (%)")))
                        .averageStorageUtilization(new BigDecimal(record.get("Avg Storage Util (%)")))
                        .averageNetworkUtilization(new BigDecimal(record.get("Avg Network Util (%)")))
                        .applicationName(record.get("Application Name"))
                        .applicationType(record.get("Application Type"))
                        .applicationOwner(record.get("Application Owner"))
                        .businessCriticality(BusinessCriticality.valueOf(record.get("Business Criticality").toUpperCase()))
                        .downtimeRequirement(DowntimeRequirement.valueOf(record.get("Downtime Requirement").toUpperCase()))
                        .hardwareDependency(Boolean.parseBoolean(record.get("Hardware Dependency")))
                        .virtualizationCompatibility(Boolean.parseBoolean(record.get("Virtualization Compatibility")))
                        .serverAgeYears(new BigDecimal(record.get("Server Age (Years)")))
                        .maintenanceStatus(record.isSet("Maintenance Status") ? record.get("Maintenance Status") : "ACTIVE")
                        .currentStatus(record.isSet("Current Status") ? record.get("Current Status") : "RUNNING")
                        .build();

                serverList.add(server);
            }

            return serverList;
        }
    }

    public static ByteArrayInputStream serversToCsv(List<ServerDto> servers) {
        final CSVFormat format = CSVFormat.DEFAULT.builder().setHeader(HEADERS).build();

        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             CSVPrinter csvPrinter = new CSVPrinter(new PrintWriter(out, true, StandardCharsets.UTF_8), format)) {

            for (ServerDto s : servers) {
                csvPrinter.printRecord(
                        s.getServerName(), s.getHostname(), s.getIpAddress(), s.getOperatingSystem(), s.getOsVersion(),
                        s.getCpuModel(), s.getCpuCores(), s.getTotalRamGb(), s.getTotalStorageGb(), s.getStorageType(),
                        s.getNetworkBandwidthGbps(), s.getAverageCpuUtilization(), s.getPeakCpuUtilization(),
                        s.getAverageRamUtilization(), s.getPeakRamUtilization(), s.getAverageStorageUtilization(),
                        s.getAverageNetworkUtilization(), s.getApplicationName(), s.getApplicationType(),
                        s.getApplicationOwner(), s.getBusinessCriticality(), s.getDowntimeRequirement(),
                        s.getHardwareDependency(), s.getVirtualizationCompatibility(), s.getServerAgeYears(),
                        s.getMaintenanceStatus(), s.getCurrentStatus()
                );
            }

            csvPrinter.flush();
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to export servers to CSV: " + e.getMessage());
        }
    }
}
