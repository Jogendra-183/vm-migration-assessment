export type Role = 'ADMIN' | 'VIEWER';

export type BusinessCriticality = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type DowntimeRequirement = 'NONE' | 'MINIMAL' | 'FLEXIBLE' | 'STRICT';

export type DependencyType = 'DATABASE' | 'APPLICATION' | 'FILE' | 'AUTHENTICATION' | 'NETWORK' | 'EXTERNAL_SERVICE';

export type Classification = 'READY_TO_MIGRATE' | 'REQUIRES_OPTIMIZATION' | 'RETIRE' | 'KEEP_PHYSICAL';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type MigrationPriority = 'PRIORITY_1' | 'PRIORITY_2' | 'PRIORITY_3' | 'PRIORITY_4';

export type WaveStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';

export interface User {
  id: number;
  username: string;
  role: Role;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  role: Role;
}

export interface Server {
  id: number;
  serverName: string;
  hostname: string;
  ipAddress: string;
  operatingSystem: string;
  osVersion: string;
  cpuModel: string;
  cpuCores: number;
  totalRamGb: number;
  totalStorageGb: number;
  storageType: string;
  networkBandwidthGbps: number;
  averageCpuUtilization: number;
  peakCpuUtilization: number;
  averageRamUtilization: number;
  peakRamUtilization: number;
  averageStorageUtilization: number;
  averageNetworkUtilization: number;
  applicationName: string;
  applicationType: string;
  applicationOwner: string;
  businessCriticality: BusinessCriticality;
  downtimeRequirement: DowntimeRequirement;
  hardwareDependency: boolean;
  virtualizationCompatibility: boolean;
  serverAgeYears: number;
  maintenanceStatus: string;
  currentStatus: string;
  createdAt: string;
  updatedAt: string;

  // Joined assessment & recommendations
  migrationScore?: number;
  classification?: Classification;
  riskLevel?: RiskLevel;
  riskScore?: number;
  migrationPriority?: MigrationPriority;
  recommendedVcpu?: number;
  recommendedRamGb?: number;
  recommendedStorageGb?: number;
  assignedWaveNumber?: number;
  assignedWaveName?: string;
}

export interface ServerCreateRequest {
  serverName: string;
  hostname: string;
  ipAddress: string;
  operatingSystem: string;
  osVersion: string;
  cpuModel: string;
  cpuCores: number;
  totalRamGb: number;
  totalStorageGb: number;
  storageType: string;
  networkBandwidthGbps: number;
  averageCpuUtilization: number;
  peakCpuUtilization: number;
  averageRamUtilization: number;
  peakRamUtilization: number;
  averageStorageUtilization: number;
  averageNetworkUtilization: number;
  applicationName: string;
  applicationType: string;
  applicationOwner: string;
  businessCriticality: BusinessCriticality;
  downtimeRequirement: DowntimeRequirement;
  hardwareDependency: boolean;
  virtualizationCompatibility: boolean;
  serverAgeYears: number;
  maintenanceStatus?: string;
  currentStatus?: string;
}

export interface ServerDetail {
  server: Server;
  assessment?: Assessment;
  vmRecommendation?: VmRecommendation;
  dependencies: Dependency[];
  performanceMetrics: PerformanceMetric[];
  waveAssignment?: MigrationWaveServer;
  sizingComparison?: SizingComparison;
}

export interface SizingComparison {
  physicalCores: number;
  physicalRamGb: number;
  physicalStorageGb: number;
  recommendedVcpu: number;
  recommendedRamGb: number;
  recommendedStorageGb: number;
  cpuHeadroomSavingsPercent: number;
  ramHeadroomSavingsPercent: number;
  estimatedPostMigCpuUtil: number;
  estimatedPostMigRamUtil: number;
}

export interface Application {
  id: number;
  name: string;
  type: string;
  owner: string;
  criticality: BusinessCriticality;
  downtimeRequirement: DowntimeRequirement;
  hardwareDependency: boolean;
  virtualizationCompatible: boolean;
  createdAt: string;
  serverCount?: number;
}

export interface Dependency {
  id: number;
  sourceServerId: number;
  sourceServerName: string;
  sourceApplicationName: string;
  targetServerId: number;
  targetServerName: string;
  targetApplicationName: string;
  dependencyType: DependencyType;
  criticality: BusinessCriticality;
  description: string;
}

export interface DependencyGraph {
  nodes: {
    id: string;
    label: string;
    type: string;
    criticality: string;
    classification: string;
  }[];
  edges: {
    id: string;
    source: string;
    target: string;
    type: string;
    criticality: string;
    label: string;
  }[];
}

export interface PerformanceMetric {
  id: number;
  serverId: number;
  timestamp: string;
  cpuUtilization: number;
  ramUtilization: number;
  storageUtilization: number;
  networkUtilization: number;
}

export interface ServerTelemetry {
  serverId: number;
  serverName: string;
  currentAvgCpu: number;
  currentPeakCpu: number;
  currentAvgRam: number;
  currentPeakRam: number;
  currentAvgStorage: number;
  currentAvgNetwork: number;
  historicalMetrics: PerformanceMetric[];
}

export interface Assessment {
  id: number;
  serverId: number;
  serverName: string;
  applicationName: string;
  migrationScore: number;
  classification: Classification;
  riskScore: number;
  riskLevel: RiskLevel;
  priorityScore: number;
  migrationPriority: MigrationPriority;
  reason: string;
  assessedAt: string;
  scoreBreakdown?: ScoreBreakdown;
}

export interface ScoreBreakdown {
  cpuScore: number;
  ramScore: number;
  storageScore: number;
  networkScore: number;
  compatibilityScore: number;
  dependencyScore: number;
  criticalityScore: number;
  weightedTotal: number;
}

export interface AssessmentSummary {
  totalServers: number;
  readyToMigrate: number;
  requiresOptimization: number;
  retire: number;
  keepPhysical: number;
  readinessPercentage: number;
  averageMigrationScore: number;
  classificationDistribution: Record<Classification, number>;
  riskDistribution: Record<RiskLevel, number>;
  priorityDistribution: Record<MigrationPriority, number>;
  lastAssessedAt?: string;
}

export interface AssessmentRunResponse {
  success: boolean;
  message: string;
  assessedServersCount: number;
  summary: AssessmentSummary;
  results: Assessment[];
}

export interface VmRecommendation {
  id: number;
  serverId: number;
  serverName: string;
  applicationName: string;
  currentCpuCores: number;
  currentRamGb: number;
  currentStorageGb: number;
  recommendedVcpu: number;
  recommendedRamGb: number;
  recommendedStorageGb: number;
  recommendedNetworkGbps: number;
  safetyMargin: number;
  estimatedCpuUtilization: number;
  estimatedRamUtilization: number;
  recommendationReason: string;
  vcpuSavings: number;
  ramSavingsGb: number;
}

export interface VmRecommendationSummary {
  totalRecommendedVms: number;
  totalPhysicalCores: number;
  totalRecommendedVcpu: number;
  totalPhysicalRamGb: number;
  totalRecommendedRamGb: number;
  totalPhysicalStorageGb: number;
  totalRecommendedStorageGb: number;
  cpuCapacityReductionPercent: number;
  ramCapacityReductionPercent: number;
}

export interface ServerRisk {
  serverId: number;
  serverName: string;
  applicationName: string;
  operatingSystem: string;
  riskScore: number;
  riskLevel: RiskLevel;
  riskReason: string;
  primaryRiskFactors: string[];
  mitigationRecommendations: string[];
}

export interface RiskMatrix {
  totalServers: number;
  lowRiskCount: number;
  mediumRiskCount: number;
  highRiskCount: number;
  criticalRiskCount: number;
  highAndCriticalRiskServers: ServerRisk[];
  commonRiskFactorFrequency: Record<string, number>;
}

export interface ServerPriority {
  serverId: number;
  serverName: string;
  applicationName: string;
  classification: Classification;
  migrationScore: number;
  riskScore: number;
  riskLevel: RiskLevel;
  priorityScore: number;
  calculatedPriority: MigrationPriority;
  effectivePriority: MigrationPriority;
  isOverridden: boolean;
  priorityReason: string;
}

export interface MigrationWave {
  id: number;
  waveNumber: number;
  waveName: string;
  description: string;
  status: WaveStatus;
  plannedDate?: string;
  serverCount: number;
  servers: MigrationWaveServer[];
}

export interface MigrationWaveServer {
  id: number;
  waveId: number;
  waveNumber: number;
  waveName: string;
  serverId: number;
  serverName: string;
  applicationName: string;
  classification?: Classification;
  riskLevel?: RiskLevel;
  priority?: MigrationPriority;
  assignedAt: string;
  notes: string;
}

export interface ConsolidationPlan {
  id: number;
  totalPhysicalServers: number;
  migratableServers: number;
  retiredServers: number;
  physicalServersRemaining: number;
  virtualizationHostsRequired: number;
  totalVcpuRequired: number;
  totalRamRequired: number;
  totalStorageRequired: number;
  consolidationRatio: number;
  createdAt: string;
  hostPlacements: HostPlacement[];
  hardwareComparison: HardwareComparison;
}

export interface HostPlacement {
  hostIndex: number;
  hostName: string;
  allocatedVcpu: number;
  hostVcpuCapacity: number;
  allocatedRamGb: number;
  hostRamCapacityGb: number;
  allocatedStorageGb: number;
  hostStorageCapacityGb: number;
  cpuUtilizationPercentage: number;
  ramUtilizationPercentage: number;
  hostedServerNames: string[];
}

export interface HardwareComparison {
  beforePhysicalHostCount: number;
  afterVirtualHostCount: number;
  beforeTotalCores: number;
  afterTotalVcpu: number;
  beforeTotalRamGb: number;
  afterTotalRamGb: number;
  beforeTotalStorageGb: number;
  afterTotalStorageGb: number;
  estimatedPowerSavingsPercent: number;
  estimatedRackSpaceSavingsPercent: number;
}

export interface SystemSetting {
  id: number;
  settingKey: string;
  settingValue: string;
  category: string;
  description: string;
}

export interface DashboardStats {
  totalServers: number;
  readyToMigrate: number;
  requiresOptimization: number;
  keepPhysical: number;
  retire: number;
  migrationReadinessPercent: number;
  highRiskServersCount: number;
  recommendedVmCount: number;
  virtualizationHostsRequired: number;
  consolidationRatio: number;
  averageCpuUtilization: number;
  averageRamUtilization: number;
  averageStorageUtilization: number;
  averageNetworkUtilization: number;
  classificationChart: {
    classification: Classification;
    label: string;
    count: number;
    percentage: number;
    colorHex: string;
  }[];
  riskChart: {
    riskLevel: RiskLevel;
    label: string;
    count: number;
    percentage: number;
    colorHex: string;
  }[];
  priorityChart: {
    priority: MigrationPriority;
    label: string;
    count: number;
  }[];
  waveProgressChart: {
    waveNumber: number;
    waveName: string;
    serverCount: number;
    status: string;
    plannedDate: string;
  }[];
  cpuUtilizationBuckets: {
    rangeLabel: string;
    count: number;
  }[];
  ramUtilizationBuckets: {
    rangeLabel: string;
    count: number;
  }[];
  infrastructureComparison: {
    physicalServersCount: number;
    physicalTotalCores: number;
    physicalTotalRamGb: number;
    physicalTotalStorageGb: number;
    targetVirtualHostsCount: number;
    targetTotalVcpu: number;
    targetTotalRamGb: number;
    targetTotalStorageGb: number;
    coreReductionPercent: number;
    ramReductionPercent: number;
  };
}

export interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ImportSummary {
  totalProcessed: number;
  successfulImports: number;
  failedImports: number;
  errors: string[];
}
