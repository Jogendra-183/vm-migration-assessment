export interface CloudHealth {
  connected: boolean;
  projectId: string;
  authenticatedAccount: string;
  defaultRegion: string;
  defaultZone: string;
  apiEnabled: boolean;
  mockMode: boolean;
  activeVmCount: number;
  message: string;
}

export interface MachineTypeOption {
  name: string;
  family: string;
  vcpu: number;
  memoryGb: number;
  description: string;
  estimatedMonthlyCostUsd: number;
  estimatedMonthlyCostInr: number;
  recommendedFor: string;
}

export interface ProvisioningPreviewRequest {
  serverId: number;
  preferredZone?: string;
  overrideMachineType?: string;
  bootDiskSizeGb?: number;
}

export interface ProvisioningPreviewResponse {
  serverId: number;
  serverName: string;
  sourceOs: string;
  sourceCores: number;
  sourceRamGb: number;
  sourceStorageGb: number;
  migrationScore: number;
  classification: string;
  riskLevel: string;
  eligibleForProvisioning: boolean;
  warnings: string[];
  recommendedMachineType: string;
  recommendedVcpu: number;
  recommendedRamGb: number;
  recommendedDiskGb: number;
  recommendedDiskType: string;
  bootImage: string;
  zone: string;
  network: string;
  estimatedHourlyCostUsd: number;
  estimatedMonthlyCostUsd: number;
  estimatedMonthlyCostInr: number;
  costAssumptions: string;
  trialCreditsNotice: string;
}

export interface CreateProvisioningRequest {
  serverId: number;
  instanceName?: string;
  zone?: string;
  machineType?: string;
  bootDiskSizeGb?: number;
  bootImage?: string;
}

export interface ApproveProvisioningRequest {
  approved: boolean;
  comment?: string;
}

export interface ProvisioningRequest {
  id: number;
  sourceServerId: number;
  sourceServerName: string;
  instanceName: string;
  projectId: string;
  zone: string;
  machineType: string;
  vcpu: number;
  ramGb: number;
  bootDiskSizeGb: number;
  bootDiskType: string;
  bootImage: string;
  vpcNetwork: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CREATING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  requestedBy: string;
  approvedBy?: string;
  approvalComment?: string;
  approvedAt?: string;
  operationId?: string;
  errorMessage?: string;
  estimatedMonthlyCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface CloudVm {
  id: number;
  sourceServerId?: number;
  sourceServerName?: string;
  instanceName: string;
  gcpInstanceId?: string;
  projectId: string;
  zone: string;
  machineType: string;
  vcpu: number;
  ramGb: number;
  bootDiskSizeGb: number;
  bootDiskType: string;
  bootImage: string;
  vpcNetwork: string;
  subnet?: string;
  internalIp?: string;
  externalIp?: string;
  status: 'PROVISIONING' | 'STAGING' | 'RUNNING' | 'STOPPING' | 'STOPPED' | 'TERMINATING' | 'TERMINATED' | 'FAILED';
  lastSyncAt: string;
  estimatedHourlyCost: number;
  estimatedMonthlyCost: number;
  costAssumptions: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CloudOperation {
  id: number;
  operationId: string;
  operationType: string;
  targetResource: string;
  zone: string;
  projectId: string;
  status: string;
  httpStatusCode?: number;
  errorMessage?: string;
  initiatedBy?: string;
  createdAt: string;
  completedAt?: string;
}
