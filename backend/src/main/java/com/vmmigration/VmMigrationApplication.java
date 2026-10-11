package com.vmmigration;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class VmMigrationApplication {

    public static void main(String[] args) {
        SpringApplication.run(VmMigrationApplication.class, args);
    }
}
