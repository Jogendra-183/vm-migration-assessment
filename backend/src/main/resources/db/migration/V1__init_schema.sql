-- V1__init_schema.sql
-- Virtual Machine Migration Assessment & Planning System Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'VIEWER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Servers table (40 physical servers inventory)
CREATE TABLE IF NOT EXISTS servers (
    id BIGSERIAL PRIMARY KEY,
    server_name VARCHAR(100) NOT NULL UNIQUE,
    hostname VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    operating_system VARCHAR(100) NOT NULL,
    os_version VARCHAR(50) NOT NULL,
    cpu_model VARCHAR(150) NOT NULL,
    cpu_cores INTEGER NOT NULL,
    total_ram_gb INTEGER NOT NULL,
    total_storage_gb INTEGER NOT NULL,
    storage_type VARCHAR(50) NOT NULL,
    network_bandwidth_gbps NUMERIC(5,2) NOT NULL DEFAULT 1.00,
    average_cpu_utilization NUMERIC(5,2) NOT NULL,
    peak_cpu_utilization NUMERIC(5,2) NOT NULL,
    average_ram_utilization NUMERIC(5,2) NOT NULL,
    peak_ram_utilization NUMERIC(5,2) NOT NULL,
    average_storage_utilization NUMERIC(5,2) NOT NULL,
    average_network_utilization NUMERIC(5,2) NOT NULL,
    application_name VARCHAR(150) NOT NULL,
    application_type VARCHAR(100) NOT NULL,
    application_owner VARCHAR(100) NOT NULL,
    business_criticality VARCHAR(20) NOT NULL,
    downtime_requirement VARCHAR(20) NOT NULL,
    hardware_dependency BOOLEAN NOT NULL DEFAULT FALSE,
    virtualization_compatibility BOOLEAN NOT NULL DEFAULT TRUE,
    server_age_years NUMERIC(4,1) NOT NULL DEFAULT 3.0,
    maintenance_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    current_status VARCHAR(50) NOT NULL DEFAULT 'RUNNING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    type VARCHAR(100) NOT NULL,
    owner VARCHAR(100) NOT NULL,
    criticality VARCHAR(20) NOT NULL,
    downtime_requirement VARCHAR(20) NOT NULL,
    hardware_dependency BOOLEAN NOT NULL DEFAULT FALSE,
    virtualization_compatible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Dependencies table
CREATE TABLE IF NOT EXISTS dependencies (
    id BIGSERIAL PRIMARY KEY,
    source_server_id BIGINT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    target_server_id BIGINT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    dependency_type VARCHAR(50) NOT NULL,
    criticality VARCHAR(20) NOT NULL,
    description TEXT,
    CONSTRAINT unique_dependency UNIQUE (source_server_id, target_server_id, dependency_type)
);

-- Historical Performance Metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id BIGSERIAL PRIMARY KEY,
    server_id BIGINT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cpu_utilization NUMERIC(5,2) NOT NULL,
    ram_utilization NUMERIC(5,2) NOT NULL,
    storage_utilization NUMERIC(5,2) NOT NULL,
    network_utilization NUMERIC(5,2) NOT NULL
);

-- Assessments table
CREATE TABLE IF NOT EXISTS assessments (
    id BIGSERIAL PRIMARY KEY,
    server_id BIGINT NOT NULL UNIQUE REFERENCES servers(id) ON DELETE CASCADE,
    migration_score NUMERIC(5,2) NOT NULL,
    classification VARCHAR(50) NOT NULL,
    risk_score NUMERIC(5,2) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    priority_score NUMERIC(5,2) NOT NULL,
    migration_priority VARCHAR(20) NOT NULL,
    reason TEXT NOT NULL,
    assessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- VM Recommendations table
CREATE TABLE IF NOT EXISTS vm_recommendations (
    id BIGSERIAL PRIMARY KEY,
    server_id BIGINT NOT NULL UNIQUE REFERENCES servers(id) ON DELETE CASCADE,
    recommended_vcpu INTEGER NOT NULL,
    recommended_ram_gb INTEGER NOT NULL,
    recommended_storage_gb INTEGER NOT NULL,
    recommended_network_gbps NUMERIC(5,2) NOT NULL,
    safety_margin NUMERIC(5,2) NOT NULL DEFAULT 20.00,
    estimated_cpu_utilization NUMERIC(5,2) NOT NULL,
    estimated_ram_utilization NUMERIC(5,2) NOT NULL,
    recommendation_reason TEXT NOT NULL
);

-- Migration Waves table
CREATE TABLE IF NOT EXISTS migration_waves (
    id BIGSERIAL PRIMARY KEY,
    wave_number INTEGER NOT NULL UNIQUE,
    wave_name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PLANNED',
    planned_date DATE
);

-- Migration Wave Servers mapping table
CREATE TABLE IF NOT EXISTS migration_wave_servers (
    id BIGSERIAL PRIMARY KEY,
    wave_id BIGINT NOT NULL REFERENCES migration_waves(id) ON DELETE CASCADE,
    server_id BIGINT NOT NULL UNIQUE REFERENCES servers(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- Consolidation Plans table
CREATE TABLE IF NOT EXISTS consolidation_plans (
    id BIGSERIAL PRIMARY KEY,
    total_physical_servers INTEGER NOT NULL,
    migratable_servers INTEGER NOT NULL,
    retired_servers INTEGER NOT NULL,
    physical_servers_remaining INTEGER NOT NULL,
    virtualization_hosts_required INTEGER NOT NULL,
    total_vcpu_required INTEGER NOT NULL,
    total_ram_required INTEGER NOT NULL,
    total_storage_required INTEGER NOT NULL,
    consolidation_ratio NUMERIC(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System Settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_servers_classification ON servers(business_criticality);
CREATE INDEX IF NOT EXISTS idx_perf_metrics_server ON performance_metrics(server_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_deps_source ON dependencies(source_server_id);
CREATE INDEX IF NOT EXISTS idx_deps_target ON dependencies(target_server_id);
