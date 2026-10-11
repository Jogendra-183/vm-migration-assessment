package com.vmmigration.service;

import com.vmmigration.dto.CloudDtos.MachineTypeOptionDto;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class CloudPricingService {

    // Exchange rate USD to INR
    private static final BigDecimal USD_TO_INR = BigDecimal.valueOf(83.50);

    // Standard hourly rates for e2 / n2 series in us-central1 (standard pricing)
    private static final Map<String, MachineTypeInfo> MACHINE_TYPES = new LinkedHashMap<>();

    static {
        // e2-micro: 2 shared vCPU, 1 GB RAM
        MACHINE_TYPES.put("e2-micro", new MachineTypeInfo("e2-micro", "E2 Shared-core", 2, 1.0, BigDecimal.valueOf(0.0084), "Micro workloads, dev/test, pilot exploration"));
        // e2-small: 2 shared vCPU, 2 GB RAM
        MACHINE_TYPES.put("e2-small", new MachineTypeInfo("e2-small", "E2 Shared-core", 2, 2.0, BigDecimal.valueOf(0.0168), "Light web services, internal utilities, batch jobs"));
        // e2-medium: 2 shared vCPU, 4 GB RAM
        MACHINE_TYPES.put("e2-medium", new MachineTypeInfo("e2-medium", "E2 Shared-core", 2, 4.0, BigDecimal.valueOf(0.0336), "General lightweight application servers, staging"));
        // e2-standard-2: 2 vCPU, 8 GB RAM
        MACHINE_TYPES.put("e2-standard-2", new MachineTypeInfo("e2-standard-2", "E2 Standard", 2, 8.0, BigDecimal.valueOf(0.0671), "Standard production application tier"));
        // e2-standard-4: 4 vCPU, 16 GB RAM
        MACHINE_TYPES.put("e2-standard-4", new MachineTypeInfo("e2-standard-4", "E2 Standard", 4, 16.0, BigDecimal.valueOf(0.1342), "Medium databases, ERP components, microservices"));
        // e2-standard-8: 8 vCPU, 32 GB RAM
        MACHINE_TYPES.put("e2-standard-8", new MachineTypeInfo("e2-standard-8", "E2 Standard", 8, 32.0, BigDecimal.valueOf(0.2685), "High-throughput application servers, cache nodes"));
        // n2-standard-2: 2 vCPU, 8 GB RAM (Cascade Lake / Ice Lake)
        MACHINE_TYPES.put("n2-standard-2", new MachineTypeInfo("n2-standard-2", "N2 Balanced", 2, 8.0, BigDecimal.valueOf(0.0971), "Consistent compute workloads, predictable IOPS"));
        // n2-standard-4: 4 vCPU, 16 GB RAM
        MACHINE_TYPES.put("n2-standard-4", new MachineTypeInfo("n2-standard-4", "N2 Balanced", 4, 16.0, BigDecimal.valueOf(0.1942), "Performance-intensive relational database replicas"));
    }

    public static class MachineTypeInfo {
        public final String name;
        public final String family;
        public final int vcpu;
        public final double memoryGb;
        public final BigDecimal hourlyCostUsd;
        public final String description;

        public MachineTypeInfo(String name, String family, int vcpu, double memoryGb, BigDecimal hourlyCostUsd, String description) {
            this.name = name;
            this.family = family;
            this.vcpu = vcpu;
            this.memoryGb = memoryGb;
            this.hourlyCostUsd = hourlyCostUsd;
            this.description = description;
        }
    }

    public List<MachineTypeOptionDto> getAvailableMachineTypes() {
        List<MachineTypeOptionDto> list = new ArrayList<>();
        for (MachineTypeInfo info : MACHINE_TYPES.values()) {
            BigDecimal monthlyUsd = info.hourlyCostUsd.multiply(BigDecimal.valueOf(730)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal monthlyInr = monthlyUsd.multiply(USD_TO_INR).setScale(2, RoundingMode.HALF_UP);
            list.add(MachineTypeOptionDto.builder()
                    .name(info.name)
                    .family(info.family)
                    .vcpu(info.vcpu)
                    .memoryGb(info.memoryGb)
                    .description(info.description)
                    .estimatedMonthlyCostUsd(monthlyUsd)
                    .estimatedMonthlyCostInr(monthlyInr)
                    .recommendedFor(info.description)
                    .build());
        }
        return list;
    }

    public String recommendMachineType(int targetVcpu, int targetRamGb) {
        if (targetVcpu <= 2 && targetRamGb <= 1) return "e2-micro";
        if (targetVcpu <= 2 && targetRamGb <= 2) return "e2-small";
        if (targetVcpu <= 2 && targetRamGb <= 4) return "e2-medium";
        if (targetVcpu <= 2 && targetRamGb <= 8) return "e2-standard-2";
        if (targetVcpu <= 4 && targetRamGb <= 16) return "e2-standard-4";
        if (targetVcpu <= 8 && targetRamGb <= 32) return "e2-standard-8";
        return "e2-standard-4"; // sensible default safe tier
    }

    public CostEstimate calculateEstimate(String machineType, int diskSizeGb) {
        MachineTypeInfo info = MACHINE_TYPES.getOrDefault(machineType, MACHINE_TYPES.get("e2-small"));

        // Hourly compute cost
        BigDecimal hourlyComputeUsd = info.hourlyCostUsd;
        // Monthly compute cost (730 hours / month)
        BigDecimal monthlyComputeUsd = hourlyComputeUsd.multiply(BigDecimal.valueOf(730));

        // Persistent disk standard (pd-standard: $0.040 per GB-month in us-central1)
        BigDecimal monthlyDiskUsd = BigDecimal.valueOf(diskSizeGb)
                .multiply(BigDecimal.valueOf(0.040))
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal hourlyDiskUsd = monthlyDiskUsd.divide(BigDecimal.valueOf(730), 4, RoundingMode.HALF_UP);

        BigDecimal totalHourlyUsd = hourlyComputeUsd.add(hourlyDiskUsd).setScale(4, RoundingMode.HALF_UP);
        BigDecimal totalMonthlyUsd = monthlyComputeUsd.add(monthlyDiskUsd).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalMonthlyInr = totalMonthlyUsd.multiply(USD_TO_INR).setScale(2, RoundingMode.HALF_UP);

        String assumptions = String.format(
                "Based on %s in us-central1 (Compute: $%.4f/hr, $%.2f/mo) + %d GB pd-standard ($0.04/GB-mo: $%.2f/mo). 730 hrs/month assumed. USD/INR @ %.2f. Note: Disks continue to incur charges while VM is STOPPED.",
                info.name, hourlyComputeUsd.doubleValue(), monthlyComputeUsd.doubleValue(), diskSizeGb, monthlyDiskUsd.doubleValue(), USD_TO_INR.doubleValue()
        );

        return new CostEstimate(totalHourlyUsd, totalMonthlyUsd, totalMonthlyInr, assumptions);
    }

    public static class CostEstimate {
        public final BigDecimal hourlyUsd;
        public final BigDecimal monthlyUsd;
        public final BigDecimal monthlyInr;
        public final String assumptions;

        public CostEstimate(BigDecimal hourlyUsd, BigDecimal monthlyUsd, BigDecimal monthlyInr, String assumptions) {
            this.hourlyUsd = hourlyUsd;
            this.monthlyUsd = monthlyUsd;
            this.monthlyInr = monthlyInr;
            this.assumptions = assumptions;
        }
    }
}
