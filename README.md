# Virtual Machine Migration Assessment & Planning System

An enterprise full-stack platform designed to analyze, assess, score, right-size, and plan the migration of **40 existing physical servers** to Virtual Machines (VMs) without performing disruptive physical operations.

---

## Key Features

1. **Physical Server Inventory (40 Servers)**: Full hardware telemetry, OS vintage, CPU/RAM/Storage/Network capacity, peak loads, application metadata, and CSV import/export.
2. **Algorithmic Migration Scoring Engine**: 7-factor weighted scoring model (CPU, RAM, Storage, Network, Compatibility, Dependency, Criticality) generating 0–100 suitability scores.
3. **4-Tier Workload Classification**:
   - `READY_TO_MIGRATE` (Score ≥ 70, compatible, no hardware lock)
   - `REQUIRES_OPTIMIZATION` (Score 40–69, needs memory tuning, OS upgrades)
   - `KEEP_PHYSICAL` (Score < 40 or PCIe/dongle hardware dependencies)
   - `RETIRE` (Underutilized legacy or obsolete workloads)
4. **VM Sizing & Capacity Right-Sizing Engine**: Calculates optimal vCPU, RAM, and Storage from peak telemetry loads with a 20% safety margin buffer, estimating post-migration load.
5. **Risk Assessment Matrix**: 4 risk tiers (Low, Medium, High, Critical) with automatic risk factor detection and mitigation recommendations.
6. **Master Migration Planner & Kanban Wave Board**: Automated 4-wave scheduling (Pilot, Core, Critical, Extended Optimization) with drag-and-drop / selector reassignments.
7. **Host Consolidation Simulator**: First-Fit Decreasing (FFD) hypervisor bin-packing simulator calculating 4:1 consolidation ratios, rack space reclamation, and power reduction.
8. **Executive Reports & Data Export**: Instant OpenPDF executive reports and Apache POI multi-tab Excel workbooks.
9. **Role-Based Access Control**: `ADMIN` (full read/write, assessment execution, wave tuning) and `VIEWER` (read-only dashboards & report exports).

---

## Architecture & Technology Stack

- **Backend**: Java 17/21, Spring Boot 3.3.4, Spring Security, JWT, Spring Data JPA, Flyway, PostgreSQL, Apache POI, OpenPDF, OpenAPI (Swagger UI).
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts.
- **Database**: PostgreSQL 16/18 with Flyway schema migration and 40-server seed dataset.
- **Containerization**: Docker, Docker Compose, Multi-stage builds with NGINX.

---

## Quick Start (Local Development)

### 1. Prerequisites
- Java 17 or Java 21
- Node.js 18+ and npm
- PostgreSQL 14+ running on port 5432 with database `vmmigration` and password `9493` (or configured via `DB_PASSWORD`)
- Maven 3.9+

### 2. Start Backend
```powershell
cd backend
mvn spring-boot:run
```
Backend will start on `http://localhost:8080`.
Swagger UI documentation is available at `http://localhost:8080/swagger-ui/index.html`.

### 3. Start Frontend
```powershell
cd frontend
npm install
npm run dev
```
Frontend will start on `http://localhost:5173`.

---

## Default User Accounts

| Role | Username | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin` | `admin123` | Full access: run assessments, CRUD servers, reassign waves, edit settings |
| **Viewer** | `viewer` | `viewer123` | Read-only access: view dashboards, servers, matrix, download PDF/Excel |

---

## Docker Deployment

To launch the entire full-stack platform (PostgreSQL, Spring Boot backend, and NGINX React frontend):

```bash
docker-compose up --build -d
```
Access the application at `http://localhost`.
