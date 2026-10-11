-- V4__cloud_integration.sql
-- Google Cloud Compute Engine Integration Schema

-- Cloud VMs managed by this application
CREATE TABLE IF NOT EXISTS cloud_vms (
    id BIGSERIAL PRIMARY KEY,
    source_server_id BIGINT REFERENCES servers(id) ON DELETE SET NULL,
    instance_name VARCHAR(100) NOT NULL UNIQUE,
    gcp_instance_id VARCHAR(100),
    project_id VARCHAR(100) NOT NULL,
    zone VARCHAR(50) NOT NULL,
    machine_type VARCHAR(50) NOT NULL,
    vcpu INTEGER NOT NULL,
    ram_gb NUMERIC(6,2) NOT NULL,
    boot_disk_size_gb INTEGER NOT NULL,
    boot_disk_type VARCHAR(50) NOT NULL DEFAULT 'pd-standard',
    boot_image VARCHAR(200),
    vpc_network VARCHAR(100) NOT NULL DEFAULT 'default',
    subnet VARCHAR(100),
    internal_ip VARCHAR(50),
    external_ip VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'PROVISIONING',
    last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    estimated_hourly_cost NUMERIC(10,4),
    estimated_monthly_cost NUMERIC(10,2),
    cost_assumptions TEXT,
    created_by VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Provisioning Requests Workflow (Request -> Admin Approval -> Execution)
CREATE TABLE IF NOT EXISTS provisioning_requests (
    id BIGSERIAL PRIMARY KEY,
    source_server_id BIGINT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    assessment_id BIGINT REFERENCES assessments(id) ON DELETE SET NULL,
    recommendation_id BIGINT REFERENCES vm_recommendations(id) ON DELETE SET NULL,
    instance_name VARCHAR(100) NOT NULL,
    project_id VARCHAR(100) NOT NULL,
    zone VARCHAR(50) NOT NULL,
    machine_type VARCHAR(50) NOT NULL,
    vcpu INTEGER NOT NULL,
    ram_gb NUMERIC(6,2) NOT NULL,
    boot_disk_size_gb INTEGER NOT NULL,
    boot_disk_type VARCHAR(50) NOT NULL DEFAULT 'pd-standard',
    boot_image VARCHAR(200) NOT NULL,
    vpc_network VARCHAR(100) NOT NULL DEFAULT 'default',
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_APPROVAL',
    requested_by VARCHAR(50) NOT NULL,
    approved_by VARCHAR(50),
    approval_comment TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    operation_id VARCHAR(150),
    error_message TEXT,
    estimated_monthly_cost NUMERIC(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Asynchronous Cloud Operation Tracking
CREATE TABLE IF NOT EXISTS cloud_operations (
    id BIGSERIAL PRIMARY KEY,
    operation_id VARCHAR(150) NOT NULL UNIQUE,
    operation_type VARCHAR(50) NOT NULL,
    target_resource VARCHAR(150) NOT NULL,
    zone VARCHAR(50) NOT NULL,
    project_id VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'RUNNING',
    http_status_code INTEGER,
    error_message TEXT,
    initiated_by VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_cloud_vms_server ON cloud_vms(source_server_id);
CREATE INDEX IF NOT EXISTS idx_cloud_vms_status ON cloud_vms(status);
CREATE INDEX IF NOT EXISTS idx_prov_req_server ON provisioning_requests(source_server_id);
CREATE INDEX IF NOT EXISTS idx_prov_req_status ON provisioning_requests(status);
CREATE INDEX IF NOT EXISTS idx_cloud_ops_status ON cloud_operations(status);
