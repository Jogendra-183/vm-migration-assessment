import { apiClient } from './client';
import {
  CloudHealth,
  MachineTypeOption,
  ProvisioningPreviewRequest,
  ProvisioningPreviewResponse,
  CreateProvisioningRequest,
  ApproveProvisioningRequest,
  ProvisioningRequest,
  CloudVm,
  CloudOperation,
} from '../types/cloud';

export const cloudApi = {
  checkHealth: async (): Promise<CloudHealth> => {
    const res = await apiClient.get<CloudHealth>('/cloud/health');
    return res.data;
  },

  getZones: async (): Promise<string[]> => {
    const res = await apiClient.get<string[]>('/cloud/zones');
    return res.data;
  },

  getMachineTypes: async (): Promise<MachineTypeOption[]> => {
    const res = await apiClient.get<MachineTypeOption[]>('/cloud/machine-types');
    return res.data;
  },

  generatePreview: async (req: ProvisioningPreviewRequest): Promise<ProvisioningPreviewResponse> => {
    const res = await apiClient.post<ProvisioningPreviewResponse>('/cloud/provisioning/preview', req);
    return res.data;
  },

  listProvisioningRequests: async (): Promise<ProvisioningRequest[]> => {
    const res = await apiClient.get<ProvisioningRequest[]>('/cloud/provisioning/requests');
    return res.data;
  },

  createProvisioningRequest: async (data: CreateProvisioningRequest): Promise<ProvisioningRequest> => {
    const res = await apiClient.post<ProvisioningRequest>('/cloud/provisioning/requests', data);
    return res.data;
  },

  approveProvisioningRequest: async (id: number, data: ApproveProvisioningRequest): Promise<ProvisioningRequest> => {
    const res = await apiClient.post<ProvisioningRequest>(`/cloud/provisioning/requests/${id}/approve`, data);
    return res.data;
  },

  executeProvisioningRequest: async (id: number): Promise<ProvisioningRequest> => {
    const res = await apiClient.post<ProvisioningRequest>(`/cloud/provisioning/requests/${id}/execute`);
    return res.data;
  },

  listVms: async (): Promise<CloudVm[]> => {
    const res = await apiClient.get<CloudVm[]>('/cloud/vms');
    return res.data;
  },

  getVm: async (id: number): Promise<CloudVm> => {
    const res = await apiClient.get<CloudVm>(`/cloud/vms/${id}`);
    return res.data;
  },

  startVm: async (id: number): Promise<CloudVm> => {
    const res = await apiClient.post<CloudVm>(`/cloud/vms/${id}/start`);
    return res.data;
  },

  stopVm: async (id: number): Promise<CloudVm> => {
    const res = await apiClient.post<CloudVm>(`/cloud/vms/${id}/stop`);
    return res.data;
  },

  syncVm: async (id: number): Promise<CloudVm> => {
    const res = await apiClient.post<CloudVm>(`/cloud/vms/${id}/sync`);
    return res.data;
  },

  deleteVm: async (id: number): Promise<CloudVm> => {
    const res = await apiClient.delete<CloudVm>(`/cloud/vms/${id}`);
    return res.data;
  },

  listOperations: async (): Promise<CloudOperation[]> => {
    const res = await apiClient.get<CloudOperation[]>('/cloud/operations');
    return res.data;
  },

  getOperation: async (id: string): Promise<CloudOperation> => {
    const res = await apiClient.get<CloudOperation>(`/cloud/operations/${id}`);
    return res.data;
  },
};
