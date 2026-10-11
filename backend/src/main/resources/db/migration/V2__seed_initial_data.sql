-- V2__seed_initial_data.sql
-- Seed 40 realistic physical servers, applications, dependencies, performance telemetry, settings, and users

-- 1. Default Users (BCrypt hashes: admin/admin123 and viewer/viewer123)
INSERT INTO users (username, password, role, created_at) VALUES
('admin', '$2a$10$hW1ftLK2ZoxyKUzfm2qpeeRfe2cIoVoIqrmFwUhA4kSiJGr.8GAsG', 'ADMIN', CURRENT_TIMESTAMP),
('viewer', '$2a$10$wa5XvVNUbQJGgzTeq48GAe3wpkL5muq0FDxLNBZ5iw1oHCYXabzOu', 'VIEWER', CURRENT_TIMESTAMP)
ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password;

-- 2. System Settings
INSERT INTO system_settings (setting_key, setting_value, category, description) VALUES
('weight_cpu', '0.25', 'SCORING_WEIGHT', 'Weight for CPU utilization score in migration calculation'),
('weight_ram', '0.20', 'SCORING_WEIGHT', 'Weight for RAM utilization score in migration calculation'),
('weight_storage', '0.10', 'SCORING_WEIGHT', 'Weight for Storage utilization score in migration calculation'),
('weight_network', '0.10', 'SCORING_WEIGHT', 'Weight for Network utilization score in migration calculation'),
('weight_compatibility', '0.15', 'SCORING_WEIGHT', 'Weight for Application & OS compatibility score'),
('weight_dependencies', '0.10', 'SCORING_WEIGHT', 'Weight for server dependency complexity score'),
('weight_criticality', '0.10', 'SCORING_WEIGHT', 'Weight for business criticality impact score'),
('threshold_cpu_low', '40.0', 'UTILIZATION_THRESHOLD', 'Upper threshold for low CPU utilization (%)'),
('threshold_cpu_normal', '70.0', 'UTILIZATION_THRESHOLD', 'Upper threshold for normal CPU utilization (%)'),
('threshold_cpu_high', '85.0', 'UTILIZATION_THRESHOLD', 'Upper threshold for high CPU utilization (%)'),
('threshold_ram_low', '50.0', 'UTILIZATION_THRESHOLD', 'Upper threshold for low RAM utilization (%)'),
('threshold_ram_normal', '75.0', 'UTILIZATION_THRESHOLD', 'Upper threshold for normal RAM utilization (%)'),
('threshold_ram_high', '90.0', 'UTILIZATION_THRESHOLD', 'Upper threshold for high RAM utilization (%)'),
('vm_safety_margin', '20.0', 'VM_SIZING', 'Safety headroom percentage added on top of peak utilization (%)'),
('host_vcpu_capacity', '64', 'CONSOLIDATION', 'Standard virtual host hypervisor vCPU capacity'),
('host_ram_capacity_gb', '256', 'CONSOLIDATION', 'Standard virtual host hypervisor RAM capacity in GB'),
('host_storage_capacity_gb', '10240', 'CONSOLIDATION', 'Standard virtual host hypervisor Storage capacity in GB'),
('risk_threshold_low', '30.0', 'RISK_THRESHOLD', 'Upper boundary for Low Risk classification'),
('risk_threshold_medium', '60.0', 'RISK_THRESHOLD', 'Upper boundary for Medium Risk classification'),
('risk_threshold_high', '80.0', 'RISK_THRESHOLD', 'Upper boundary for High Risk classification'),
('max_wave_size', '10', 'WAVE_PLANNING', 'Target maximum number of servers per migration wave')
ON CONFLICT (setting_key) DO NOTHING;

-- 3. Migration Waves
INSERT INTO migration_waves (wave_number, wave_name, description, status, planned_date) VALUES
(1, 'Wave 1 - Pilot & Quick Wins', 'Low-risk standalone web servers, dev tools, and non-critical internal apps', 'IN_PROGRESS', '2026-10-15'),
(2, 'Wave 2 - Core Tier Services', 'Standard application servers, caching tiers, and departmental business systems', 'PLANNED', '2026-11-15'),
(3, 'Wave 3 - Mission Critical & DBs', 'Tier-1 database clusters, enterprise ERP components, and high-criticality services', 'PLANNED', '2026-12-15'),
(4, 'Wave 4 - Extended Optimization', 'Workloads requiring code or OS upgrades prior to final cutover', 'PLANNED', '2027-01-20')
ON CONFLICT (wave_number) DO NOTHING;

-- 4. Applications (40 Apps)
INSERT INTO applications (id, name, type, owner, criticality, downtime_requirement, hardware_dependency, virtualization_compatible) VALUES
(1, 'Corporate Portal Frontend', 'WEB', 'Marketing Team', 'LOW', 'FLEXIBLE', FALSE, TRUE),
(2, 'E-Commerce Storefront UI', 'WEB', 'E-Commerce Ops', 'HIGH', 'MINIMAL', FALSE, TRUE),
(3, 'Customer Support Gateway', 'WEB', 'Customer Success', 'MEDIUM', 'FLEXIBLE', FALSE, TRUE),
(4, 'Partner API Gateway', 'API_GATEWAY', 'Integrations Team', 'HIGH', 'MINIMAL', FALSE, TRUE),
(5, 'Internal Knowledgebase Wiki', 'INTERNAL_TOOL', 'IT Operations', 'LOW', 'FLEXIBLE', FALSE, TRUE),
(6, 'Payment Processing Engine', 'TRANSACTIONAL', 'Fintech Team', 'CRITICAL', 'NONE', TRUE, FALSE),
(7, 'ERP Core Application', 'ERP', 'Enterprise Apps', 'CRITICAL', 'MINIMAL', FALSE, TRUE),
(8, 'CRM Business Service', 'CRM', 'Sales Ops', 'HIGH', 'MINIMAL', FALSE, TRUE),
(9, 'Human Resources Management', 'HRMS', 'HR Operations', 'MEDIUM', 'FLEXIBLE', FALSE, TRUE),
(10, 'Warehouse Inventory Tracker', 'SUPPLY_CHAIN', 'Logistics', 'HIGH', 'MINIMAL', FALSE, TRUE),
(11, 'Financial Reporting Ledger', 'FINANCIAL', 'Finance', 'HIGH', 'MINIMAL', FALSE, TRUE),
(12, 'Supply Chain EDI Processor', 'B2B_EDI', 'Logistics', 'HIGH', 'MINIMAL', FALSE, TRUE),
(13, 'Customer Identity Provider', 'IAM_AUTH', 'Security Team', 'CRITICAL', 'NONE', FALSE, TRUE),
(14, 'Single Sign-On Keycloak', 'IAM_AUTH', 'Security Team', 'HIGH', 'MINIMAL', FALSE, TRUE),
(15, 'Product Catalog Database', 'DATABASE', 'DBA Team', 'HIGH', 'MINIMAL', FALSE, TRUE),
(16, 'Customer Profiles Database', 'DATABASE', 'DBA Team', 'HIGH', 'MINIMAL', FALSE, TRUE),
(17, 'Orders Master PostgreSQL', 'DATABASE', 'DBA Team', 'CRITICAL', 'MINIMAL', FALSE, TRUE),
(18, 'Analytics Clickhouse Store', 'OLAP_DATABASE', 'Data Engineering', 'MEDIUM', 'FLEXIBLE', FALSE, TRUE),
(19, 'Legacy FoxPro Inventory', 'LEGACY_DESKTOP', 'Archived Ops', 'LOW', 'FLEXIBLE', FALSE, FALSE),
(20, 'Archived Tax Data System', 'COMPLIANCE_STORE', 'Legal/Finance', 'LOW', 'FLEXIBLE', FALSE, TRUE),
(21, 'Decommissioned Blog Server', 'LEGACY_WEB', 'Marketing Team', 'LOW', 'FLEXIBLE', FALSE, TRUE),
(22, 'Redis Session Cache Cluster', 'CACHE', 'Platform Infra', 'MEDIUM', 'MINIMAL', FALSE, TRUE),
(23, 'Memcached Token Store', 'CACHE', 'Platform Infra', 'LOW', 'FLEXIBLE', FALSE, TRUE),
(24, 'Elasticsearch Log Cluster 01', 'SEARCH_LOGGING', 'DevOps Team', 'MEDIUM', 'FLEXIBLE', FALSE, TRUE),
(25, 'Prometheus Metrics Collector', 'MONITORING', 'DevOps Team', 'MEDIUM', 'FLEXIBLE', FALSE, TRUE),
(26, 'Grafana Dashboards', 'MONITORING', 'DevOps Team', 'LOW', 'FLEXIBLE', FALSE, TRUE),
(27, 'Kafka Event Broker 01', 'MESSAGING', 'Platform Infra', 'HIGH', 'MINIMAL', FALSE, TRUE),
(28, 'RabbitMQ Task Queue', 'MESSAGING', 'Platform Infra', 'MEDIUM', 'MINIMAL', FALSE, TRUE),
(29, 'Enterprise Jenkins CI Master', 'CI_CD', 'Engineering Ops', 'MEDIUM', 'FLEXIBLE', FALSE, TRUE),
(30, 'GitLab Code Repository', 'DEV_TOOLS', 'Engineering Ops', 'HIGH', 'MINIMAL', FALSE, TRUE),
(31, 'Artifact Nexus Repository', 'DEV_TOOLS', 'Engineering Ops', 'MEDIUM', 'FLEXIBLE', FALSE, TRUE),
(32, 'Corporate NFS File Share', 'FILE_STORAGE', 'IT Operations', 'MEDIUM', 'FLEXIBLE', FALSE, TRUE),
(33, 'Document Archive Store', 'FILE_STORAGE', 'Legal Compliance', 'LOW', 'FLEXIBLE', FALSE, TRUE),
(34, 'Real-time High Frequency Engine', 'SPECIALIZED_COMPUTE', 'Trading Ops', 'CRITICAL', 'NONE', TRUE, FALSE),
(35, 'Legacy Mainframe Connect Gateway', 'LEGACY_HARDWARE', 'Core Banking', 'CRITICAL', 'NONE', TRUE, FALSE),
(36, 'GPU Machine Learning Worker', 'AI_GPU_INFERENCE', 'Data Science', 'MEDIUM', 'FLEXIBLE', TRUE, FALSE),
(37, 'Old Intranet Cold Storage', 'LEGACY_STORE', 'IT Operations', 'LOW', 'FLEXIBLE', FALSE, TRUE),
(38, 'Billing Notification Dispatcher', 'BACKGROUND_WORKER', 'Billing Team', 'HIGH', 'MINIMAL', FALSE, TRUE),
(39, 'Email SMTP Gateway', 'COMMUNICATIONS', 'IT Operations', 'MEDIUM', 'FLEXIBLE', FALSE, TRUE),
(40, 'External Security Proxy', 'SECURITY_EDGE', 'Network Security', 'HIGH', 'MINIMAL', FALSE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 5. 40 Physical Servers
INSERT INTO servers (
    id, server_name, hostname, ip_address, operating_system, os_version, cpu_model, cpu_cores, total_ram_gb,
    total_storage_gb, storage_type, network_bandwidth_gbps, average_cpu_utilization, peak_cpu_utilization,
    average_ram_utilization, peak_ram_utilization, average_storage_utilization, average_network_utilization,
    application_name, application_type, application_owner, business_criticality, downtime_requirement,
    hardware_dependency, virtualization_compatibility, server_age_years, maintenance_status, current_status
) VALUES
-- Batch 1: Ready To Migrate (Web, App, Caching, Internal Tools, Dev Tools)
(1, 'WEB-CORP-01', 'web-corp-01.corp.local', '10.0.1.11', 'Ubuntu Linux', '22.04 LTS', 'Intel Xeon E5-2630 v4', 8, 32, 500, 'SSD', 1.00, 18.5, 32.0, 42.0, 55.0, 38.0, 15.0, 'Corporate Portal Frontend', 'WEB', 'Marketing Team', 'LOW', 'FLEXIBLE', FALSE, TRUE, 3.2, 'ACTIVE', 'RUNNING'),
(2, 'WEB-ECOMM-01', 'web-ecomm-01.corp.local', '10.0.1.12', 'Ubuntu Linux', '22.04 LTS', 'Intel Xeon Gold 5218', 16, 64, 1000, 'NVMe SSD', 10.00, 34.0, 58.0, 52.0, 68.0, 45.0, 32.0, 'E-Commerce Storefront UI', 'WEB', 'E-Commerce Ops', 'HIGH', 'MINIMAL', FALSE, TRUE, 2.1, 'ACTIVE', 'RUNNING'),
(3, 'WEB-SUPP-01', 'web-supp-01.corp.local', '10.0.1.13', 'Ubuntu Linux', '20.04 LTS', 'Intel Xeon E5-2620 v3', 8, 32, 500, 'SSD', 1.00, 22.0, 38.0, 45.0, 60.0, 40.0, 18.0, 'Customer Support Gateway', 'WEB', 'Customer Success', 'MEDIUM', 'FLEXIBLE', FALSE, TRUE, 4.5, 'ACTIVE', 'RUNNING'),
(4, 'API-GW-01', 'api-gw-01.corp.local', '10.0.1.20', 'Red Hat Enterprise Linux', '8.6', 'Intel Xeon Silver 4214', 12, 48, 600, 'SSD', 10.00, 28.0, 46.0, 48.0, 62.0, 35.0, 42.0, 'Partner API Gateway', 'API_GATEWAY', 'Integrations Team', 'HIGH', 'MINIMAL', FALSE, TRUE, 2.8, 'ACTIVE', 'RUNNING'),
(5, 'WIKI-INT-01', 'wiki-int-01.corp.local', '10.0.1.25', 'Debian Linux', '11 Bullseye', 'Intel Xeon E5-2609 v4', 4, 16, 300, 'HDD', 1.00, 12.0, 24.0, 35.0, 48.0, 52.0, 8.0, 'Internal Knowledgebase Wiki', 'INTERNAL_TOOL', 'IT Operations', 'LOW', 'FLEXIBLE', FALSE, TRUE, 5.0, 'ACTIVE', 'RUNNING'),
(6, 'APP-HRMS-01', 'app-hrms-01.corp.local', '10.0.2.15', 'Windows Server', '2019 Standard', 'Intel Xeon Silver 4110', 8, 32, 800, 'SSD', 1.00, 20.0, 36.0, 45.0, 58.0, 42.0, 12.0, 'Human Resources Management', 'HRMS', 'HR Operations', 'MEDIUM', 'FLEXIBLE', FALSE, TRUE, 3.5, 'ACTIVE', 'RUNNING'),
(7, 'APP-LOGIS-01', 'app-logis-01.corp.local', '10.0.2.18', 'Red Hat Enterprise Linux', '8.4', 'Intel Xeon Gold 5120', 12, 48, 1200, 'SSD', 1.00, 31.0, 52.0, 50.0, 65.0, 48.0, 22.0, 'Warehouse Inventory Tracker', 'SUPPLY_CHAIN', 'Logistics', 'HIGH', 'MINIMAL', FALSE, TRUE, 3.0, 'ACTIVE', 'RUNNING'),
(8, 'APP-FIN-01', 'app-fin-01.corp.local', '10.0.2.20', 'Windows Server', '2019 Datacenter', 'Intel Xeon Gold 6230', 16, 64, 1500, 'SSD', 10.00, 35.0, 56.0, 58.0, 72.0, 54.0, 25.0, 'Financial Reporting Ledger', 'FINANCIAL', 'Finance', 'HIGH', 'MINIMAL', FALSE, TRUE, 2.4, 'ACTIVE', 'RUNNING'),
(9, 'APP-EDI-01', 'app-edi-01.corp.local', '10.0.2.22', 'Ubuntu Linux', '22.04 LTS', 'Intel Xeon E-2288G', 8, 32, 600, 'SSD', 1.00, 24.0, 42.0, 40.0, 55.0, 36.0, 16.0, 'Supply Chain EDI Processor', 'B2B_EDI', 'Logistics', 'HIGH', 'MINIMAL', FALSE, TRUE, 2.0, 'ACTIVE', 'RUNNING'),
(10, 'IAM-SSO-01', 'iam-sso-01.corp.local', '10.0.3.10', 'Ubuntu Linux', '22.04 LTS', 'Intel Xeon Silver 4210R', 10, 32, 400, 'SSD', 1.00, 26.0, 45.0, 46.0, 60.0, 30.0, 28.0, 'Single Sign-On Keycloak', 'IAM_AUTH', 'Security Team', 'HIGH', 'MINIMAL', FALSE, TRUE, 2.2, 'ACTIVE', 'RUNNING'),
(11, 'DB-CATALOG-01', 'db-catalog-01.corp.local', '10.0.4.15', 'Ubuntu Linux', '20.04 LTS', 'Intel Xeon Gold 6130', 16, 64, 2000, 'NVMe SSD', 10.00, 32.0, 55.0, 58.0, 74.0, 62.0, 35.0, 'Product Catalog Database', 'DATABASE', 'DBA Team', 'HIGH', 'MINIMAL', FALSE, TRUE, 3.8, 'ACTIVE', 'RUNNING'),
(12, 'DB-CUST-01', 'db-cust-01.corp.local', '10.0.4.18', 'Red Hat Enterprise Linux', '8.5', 'Intel Xeon Gold 6248', 20, 96, 3000, 'NVMe SSD', 10.00, 38.0, 62.0, 60.0, 76.0, 65.0, 38.0, 'Customer Profiles Database', 'DATABASE', 'DBA Team', 'HIGH', 'MINIMAL', FALSE, TRUE, 2.9, 'ACTIVE', 'RUNNING'),
(13, 'CACHE-REDIS-01', 'cache-redis-01.corp.local', '10.0.5.10', 'Ubuntu Linux', '22.04 LTS', 'Intel Xeon E-2276G', 6, 64, 400, 'SSD', 10.00, 15.0, 28.0, 48.0, 64.0, 20.0, 30.0, 'Redis Session Cache Cluster', 'CACHE', 'Platform Infra', 'MEDIUM', 'MINIMAL', FALSE, TRUE, 1.8, 'ACTIVE', 'RUNNING'),
(14, 'CACHE-MEMC-01', 'cache-memc-01.corp.local', '10.0.5.12', 'Ubuntu Linux', '20.04 LTS', 'Intel Xeon E-2144G', 4, 32, 200, 'SSD', 1.00, 10.0, 20.0, 38.0, 50.0, 15.0, 18.0, 'Memcached Token Store', 'CACHE', 'Platform Infra', 'LOW', 'FLEXIBLE', FALSE, TRUE, 3.6, 'ACTIVE', 'RUNNING'),
(15, 'LOG-ELK-01', 'log-elk-01.corp.local', '10.0.6.10', 'Ubuntu Linux', '22.04 LTS', 'Intel Xeon Gold 5218', 16, 64, 4000, 'SSD', 10.00, 36.0, 64.0, 62.0, 78.0, 70.0, 45.0, 'Elasticsearch Log Cluster 01', 'SEARCH_LOGGING', 'DevOps Team', 'MEDIUM', 'FLEXIBLE', FALSE, TRUE, 2.5, 'ACTIVE', 'RUNNING'),
(16, 'MON-PROM-01', 'mon-prom-01.corp.local', '10.0.6.15', 'Ubuntu Linux', '22.04 LTS', 'Intel Xeon Silver 4208', 8, 32, 1000, 'SSD', 1.00, 25.0, 44.0, 42.0, 58.0, 55.0, 22.0, 'Prometheus Metrics Collector', 'MONITORING', 'DevOps Team', 'MEDIUM', 'FLEXIBLE', FALSE, TRUE, 2.0, 'ACTIVE', 'RUNNING'),
(17, 'MON-GRAF-01', 'mon-graf-01.corp.local', '10.0.6.16', 'Ubuntu Linux', '22.04 LTS', 'Intel Xeon E3-1240 v6', 4, 16, 200, 'SSD', 1.00, 8.0, 18.0, 28.0, 40.0, 22.0, 6.0, 'Grafana Dashboards', 'MONITORING', 'DevOps Team', 'LOW', 'FLEXIBLE', FALSE, TRUE, 3.1, 'ACTIVE', 'RUNNING'),
(18, 'MSG-RABBIT-01', 'msg-rabbit-01.corp.local', '10.0.7.12', 'Ubuntu Linux', '20.04 LTS', 'Intel Xeon E-2278G', 8, 32, 500, 'SSD', 1.00, 22.0, 40.0, 44.0, 58.0, 32.0, 26.0, 'RabbitMQ Task Queue', 'MESSAGING', 'Platform Infra', 'MEDIUM', 'MINIMAL', FALSE, TRUE, 3.0, 'ACTIVE', 'RUNNING'),
(19, 'CI-JENKINS-01', 'ci-jenkins-01.corp.local', '10.0.8.10', 'Ubuntu Linux', '22.04 LTS', 'Intel Xeon Gold 5118', 12, 64, 2000, 'SSD', 1.00, 35.0, 62.0, 55.0, 72.0, 60.0, 34.0, 'Enterprise Jenkins CI Master', 'CI_CD', 'Engineering Ops', 'MEDIUM', 'FLEXIBLE', FALSE, TRUE, 2.7, 'ACTIVE', 'RUNNING'),
(20, 'GIT-LAB-01', 'git-lab-01.corp.local', '10.0.8.15', 'Ubuntu Linux', '22.04 LTS', 'Intel Xeon Gold 6226R', 16, 64, 3000, 'NVMe SSD', 10.00, 28.0, 48.0, 46.0, 62.0, 58.0, 28.0, 'GitLab Code Repository', 'DEV_TOOLS', 'Engineering Ops', 'HIGH', 'MINIMAL', FALSE, TRUE, 1.9, 'ACTIVE', 'RUNNING'),
(21, 'NEXUS-REPO-01', 'nexus-repo-01.corp.local', '10.0.8.20', 'Ubuntu Linux', '20.04 LTS', 'Intel Xeon E-2286G', 6, 32, 4000, 'HDD', 1.00, 18.0, 32.0, 40.0, 52.0, 68.0, 24.0, 'Artifact Nexus Repository', 'DEV_TOOLS', 'Engineering Ops', 'MEDIUM', 'FLEXIBLE', FALSE, TRUE, 3.8, 'ACTIVE', 'RUNNING'),
(22, 'FILE-SHARE-01', 'file-share-01.corp.local', '10.0.9.10', 'Windows Server', '2019 Standard', 'Intel Xeon Silver 4114', 10, 32, 8000, 'HDD', 10.00, 16.0, 30.0, 38.0, 50.0, 72.0, 38.0, 'Corporate NFS File Share', 'FILE_STORAGE', 'IT Operations', 'MEDIUM', 'FLEXIBLE', FALSE, TRUE, 4.2, 'ACTIVE', 'RUNNING'),
(23, 'ARCH-STORE-01', 'arch-store-01.corp.local', '10.0.9.15', 'Windows Server', '2016 Datacenter', 'Intel Xeon E5-2603 v4', 6, 32, 12000, 'HDD', 1.00, 11.0, 22.0, 32.0, 45.0, 80.0, 12.0, 'Document Archive Store', 'FILE_STORAGE', 'Legal Compliance', 'LOW', 'FLEXIBLE', FALSE, TRUE, 5.8, 'ACTIVE', 'RUNNING'),
(24, 'WORKER-BILL-01', 'worker-bill-01.corp.local', '10.0.10.10', 'Ubuntu Linux', '22.04 LTS', 'Intel Xeon Silver 4215', 8, 32, 500, 'SSD', 1.00, 24.0, 46.0, 42.0, 58.0, 35.0, 18.0, 'Billing Notification Dispatcher', 'BACKGROUND_WORKER', 'Billing Team', 'HIGH', 'MINIMAL', FALSE, TRUE, 2.1, 'ACTIVE', 'RUNNING'),
(25, 'SMTP-RELAY-01', 'smtp-relay-01.corp.local', '10.0.10.15', 'Debian Linux', '11 Bullseye', 'Intel Xeon E3-1230 v5', 4, 16, 300, 'SSD', 1.00, 14.0, 26.0, 30.0, 42.0, 28.0, 14.0, 'Email SMTP Gateway', 'COMMUNICATIONS', 'IT Operations', 'MEDIUM', 'FLEXIBLE', FALSE, TRUE, 4.0, 'ACTIVE', 'RUNNING'),

-- Batch 2: Requires Optimization (Heavy Memory Spikes, High Load DBs, Outdated Minor Config, Storage Near Capacity)
(26, 'APP-ERP-01', 'app-erp-01.corp.local', '10.0.2.10', 'Windows Server', '2016 Datacenter', 'Intel Xeon Gold 6140', 18, 96, 2500, 'SSD', 10.00, 72.0, 89.0, 78.0, 92.0, 76.0, 44.0, 'ERP Core Application', 'ERP', 'Enterprise Apps', 'CRITICAL', 'MINIMAL', FALSE, TRUE, 4.8, 'ACTIVE', 'RUNNING'),
(27, 'APP-CRM-01', 'app-crm-01.corp.local', '10.0.2.12', 'Windows Server', '2016 Standard', 'Intel Xeon Gold 5115', 10, 48, 1200, 'SSD', 1.00, 68.0, 86.0, 72.0, 88.0, 74.0, 36.0, 'CRM Business Service', 'CRM', 'Sales Ops', 'HIGH', 'MINIMAL', FALSE, TRUE, 4.6, 'ACTIVE', 'RUNNING'),
(28, 'IAM-CORE-01', 'iam-core-01.corp.local', '10.0.3.05', 'Red Hat Enterprise Linux', '7.9', 'Intel Xeon Gold 6138', 20, 64, 1000, 'SSD', 10.00, 65.0, 84.0, 70.0, 86.0, 62.0, 52.0, 'Customer Identity Provider', 'IAM_AUTH', 'Security Team', 'CRITICAL', 'NONE', FALSE, TRUE, 5.2, 'ACTIVE', 'RUNNING'),
(29, 'DB-ORDERS-01', 'db-orders-01.corp.local', '10.0.4.10', 'Red Hat Enterprise Linux', '8.4', 'Intel Xeon Platinum 8268', 24, 128, 5000, 'NVMe SSD', 10.00, 74.0, 91.0, 82.0, 94.0, 82.0, 60.0, 'Orders Master PostgreSQL', 'DATABASE', 'DBA Team', 'CRITICAL', 'MINIMAL', FALSE, TRUE, 2.8, 'ACTIVE', 'RUNNING'),
(30, 'DB-OLAP-01', 'db-olap-01.corp.local', '10.0.4.25', 'Ubuntu Linux', '20.04 LTS', 'Intel Xeon Gold 6242R', 20, 128, 8000, 'NVMe SSD', 10.00, 70.0, 88.0, 76.0, 90.0, 85.0, 65.0, 'Analytics Clickhouse Store', 'OLAP_DATABASE', 'Data Engineering', 'MEDIUM', 'FLEXIBLE', FALSE, TRUE, 3.1, 'ACTIVE', 'RUNNING'),
(31, 'MSG-KAFKA-01', 'msg-kafka-01.corp.local', '10.0.7.10', 'Ubuntu Linux', '20.04 LTS', 'Intel Xeon Gold 5220', 18, 64, 4000, 'NVMe SSD', 10.00, 62.0, 82.0, 74.0, 88.0, 78.0, 72.0, 'Kafka Event Broker 01', 'MESSAGING', 'Platform Infra', 'HIGH', 'MINIMAL', FALSE, TRUE, 3.4, 'ACTIVE', 'RUNNING'),
(32, 'SEC-EDGE-01', 'sec-edge-01.corp.local', '10.0.10.20', 'FreeBSD', '13.1-RELEASE', 'Intel Xeon Silver 4214Y', 12, 32, 500, 'SSD', 10.00, 66.0, 85.0, 68.0, 84.0, 45.0, 82.0, 'External Security Proxy', 'SECURITY_EDGE', 'Network Security', 'HIGH', 'MINIMAL', FALSE, TRUE, 3.9, 'ACTIVE', 'RUNNING'),

-- Batch 3: Retire (Obsolete OS, Abandoned Applications, Decommission Targets)
(33, 'LEG-FOXPRO-01', 'leg-foxpro-01.corp.local', '10.0.11.10', 'Windows Server', '2003 R2 (Legacy)', 'Intel Xeon 5130', 2, 4, 160, 'HDD', 0.10, 8.0, 15.0, 25.0, 35.0, 45.0, 2.0, 'Legacy FoxPro Inventory', 'LEGACY_DESKTOP', 'Archived Ops', 'LOW', 'FLEXIBLE', FALSE, FALSE, 14.5, 'END_OF_LIFE', 'DECOMMISSION_CANDIDATE'),
(34, 'COMPL-TAX-01', 'compl-tax-01.corp.local', '10.0.11.15', 'Windows Server', '2008 R2 SP1', 'Intel Xeon E5520', 4, 8, 300, 'HDD', 0.10, 6.0, 12.0, 30.0, 40.0, 88.0, 1.0, 'Archived Tax Data System', 'COMPLIANCE_STORE', 'Legal/Finance', 'LOW', 'FLEXIBLE', FALSE, TRUE, 12.0, 'END_OF_LIFE', 'MAINTENANCE'),
(35, 'DECOM-BLOG-01', 'decom-blog-01.corp.local', '10.0.11.20', 'CentOS Linux', '6.10 (EOL)', 'Intel Core 2 Quad Q6600', 4, 8, 250, 'HDD', 0.10, 4.0, 8.0, 20.0, 30.0, 35.0, 1.0, 'Decommissioned Blog Server', 'LEGACY_WEB', 'Marketing Team', 'LOW', 'FLEXIBLE', FALSE, TRUE, 11.2, 'DEPRECATED', 'INACTIVE'),
(36, 'COLD-INTRA-01', 'cold-intra-01.corp.local', '10.0.11.25', 'Ubuntu Linux', '14.04 LTS (EOL)', 'Intel Xeon E5405', 4, 8, 500, 'HDD', 0.10, 5.0, 10.0, 22.0, 32.0, 92.0, 1.0, 'Old Intranet Cold Storage', 'LEGACY_STORE', 'IT Operations', 'LOW', 'FLEXIBLE', FALSE, TRUE, 10.8, 'END_OF_LIFE', 'DECOMMISSION_CANDIDATE'),

-- Batch 4: Keep Physical (Hardware Dongles/PCI Lock, Extreme Latency, Dedicated SAN/GPU Requirements)
(37, 'PAY-HSM-01', 'pay-hsm-01.corp.local', '10.0.12.05', 'Red Hat Enterprise Linux', '8.4', 'Intel Xeon Gold 6230R', 16, 64, 800, 'SSD', 10.00, 32.0, 50.0, 45.0, 60.0, 40.0, 25.0, 'Payment Processing Engine', 'TRANSACTIONAL', 'Fintech Team', 'CRITICAL', 'NONE', TRUE, FALSE, 2.5, 'ACTIVE', 'RUNNING'),
(38, 'HFT-COMP-01', 'hft-comp-01.corp.local', '10.0.12.10', 'Oracle Enterprise Linux', '8.6', 'AMD EPYC 7763 High-Freq', 64, 256, 4000, 'NVMe SSD', 40.00, 88.0, 98.0, 85.0, 96.0, 50.0, 92.0, 'Real-time High Frequency Engine', 'SPECIALIZED_COMPUTE', 'Trading Ops', 'CRITICAL', 'NONE', TRUE, FALSE, 1.2, 'ACTIVE', 'RUNNING'),
(39, 'MF-CONN-01', 'mf-conn-01.corp.local', '10.0.12.15', 'AIX / RHEL Hybrid', '7.2 / 8.2', 'IBM POWER8 / Xeon Bridge', 8, 32, 500, 'SCSI Direct', 1.00, 24.0, 42.0, 50.0, 65.0, 35.0, 15.0, 'Legacy Mainframe Connect Gateway', 'LEGACY_HARDWARE', 'Core Banking', 'CRITICAL', 'NONE', TRUE, FALSE, 8.5, 'SPECIAL_MAINTENANCE', 'RUNNING'),
(40, 'GPU-INFER-01', 'gpu-infer-01.corp.local', '10.0.12.20', 'Ubuntu Linux', '22.04 LTS', 'Dual AMD EPYC 7543 + 4x A100 GPU', 64, 512, 8000, 'NVMe SSD', 40.00, 75.0, 95.0, 80.0, 92.0, 60.0, 85.0, 'GPU Machine Learning Worker', 'AI_GPU_INFERENCE', 'Data Science', 'MEDIUM', 'FLEXIBLE', TRUE, FALSE, 1.5, 'ACTIVE', 'RUNNING')
ON CONFLICT (id) DO NOTHING;

-- 6. Server Dependencies
INSERT INTO dependencies (source_server_id, target_server_id, dependency_type, criticality, description) VALUES
-- Web to App & Cache
(1, 10, 'AUTHENTICATION', 'MEDIUM', 'Corporate portal authenticates against Keycloak SSO'),
(2, 4, 'APPLICATION', 'HIGH', 'Storefront UI calls partner & commerce API gateways'),
(2, 13, 'APPLICATION', 'HIGH', 'Storefront session state cached in Redis cluster'),
(3, 10, 'AUTHENTICATION', 'MEDIUM', 'Customer support staff authenticate via SSO'),
(3, 12, 'DATABASE', 'HIGH', 'Support gateway reads customer support profiles'),
-- API Gateway to Core Services & Auth
(4, 26, 'APPLICATION', 'CRITICAL', 'API gateway orchestrates ERP core transactions'),
(4, 27, 'APPLICATION', 'HIGH', 'API gateway integrates CRM lead conversions'),
(4, 28, 'AUTHENTICATION', 'CRITICAL', 'API gateway validates customer auth tokens'),
(4, 31, 'APPLICATION', 'HIGH', 'API gateway publishes order events to Kafka broker'),
-- Apps to Databases & Queues
(7, 11, 'DATABASE', 'HIGH', 'Warehouse tracker synchronizes with product catalog'),
(8, 29, 'DATABASE', 'CRITICAL', 'Financial ledger writes settlements to orders master DB'),
(9, 29, 'DATABASE', 'HIGH', 'EDI processor synchronizes inventory orders to master DB'),
(9, 18, 'APPLICATION', 'MEDIUM', 'EDI processor posts async background tasks to RabbitMQ'),
(24, 29, 'DATABASE', 'HIGH', 'Billing worker fetches unpaid orders from master DB'),
(24, 25, 'EXTERNAL_SERVICE', 'MEDIUM', 'Billing worker relays customer receipts through SMTP gateway'),
(26, 29, 'DATABASE', 'CRITICAL', 'ERP core database operations on master cluster'),
(26, 31, 'APPLICATION', 'HIGH', 'ERP core sends state change telemetry to Kafka'),
(27, 12, 'DATABASE', 'HIGH', 'CRM service reads customer CRM records from DB-CUST-01'),
-- Monitoring & DevOps to Infrastructure
(15, 29, 'APPLICATION', 'LOW', 'Elasticsearch indexes audit trail logs from database hosts'),
(16, 1, 'NETWORK', 'LOW', 'Prometheus scrapes node metrics from web portal'),
(16, 2, 'NETWORK', 'LOW', 'Prometheus scrapes node metrics from storefront'),
(16, 26, 'NETWORK', 'LOW', 'Prometheus scrapes node metrics from ERP cluster'),
(16, 29, 'NETWORK', 'LOW', 'Prometheus scrapes node metrics from Orders DB'),
(17, 16, 'APPLICATION', 'LOW', 'Grafana renders dashboards from Prometheus metrics'),
-- CI/CD & DevOps
(19, 20, 'APPLICATION', 'MEDIUM', 'Jenkins pulls build jobs and webhooks from GitLab'),
(19, 21, 'FILE', 'MEDIUM', 'Jenkins pushes built release artifacts to Nexus'),
-- Critical Tier / Keep Physical dependencies
(37, 28, 'AUTHENTICATION', 'CRITICAL', 'Payment HSM verifies customer transaction auth tokens'),
(37, 29, 'DATABASE', 'CRITICAL', 'Payment engine commits transaction settlements to DB-ORDERS-01'),
(38, 29, 'DATABASE', 'CRITICAL', 'HFT engine connects directly to low-latency order matching DB'),
(39, 26, 'EXTERNAL_SERVICE', 'CRITICAL', 'Mainframe gateway translates legacy transactions for ERP')
ON CONFLICT (source_server_id, target_server_id, dependency_type) DO NOTHING;

-- 7. Performance Metrics Snapshots (Historical samples per server for time-series charts)
INSERT INTO performance_metrics (server_id, timestamp, cpu_utilization, ram_utilization, storage_utilization, network_utilization)
SELECT 
    s.id,
    CURRENT_TIMESTAMP - (i || ' hours')::INTERVAL,
    GREATEST(5.0, LEAST(99.0, s.average_cpu_utilization + (SIN(i * 0.8) * 8.0) + (RANDOM() * 6.0 - 3.0))),
    GREATEST(10.0, LEAST(99.0, s.average_ram_utilization + (COS(i * 0.6) * 6.0) + (RANDOM() * 4.0 - 2.0))),
    GREATEST(10.0, LEAST(99.0, s.average_storage_utilization + (i * 0.05))),
    GREATEST(2.0, LEAST(99.0, s.average_network_utilization + (SIN(i * 1.2) * 5.0) + (RANDOM() * 4.0 - 2.0)))
FROM servers s
CROSS JOIN generate_series(1, 12) AS i;
