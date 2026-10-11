import { apiClient } from './client';
import { Server, ServerCreateRequest, ServerDetail, PagedResponse, ImportSummary } from '../types';

export const serversApi = {
  getServers: async (params?: {
    search?: string;
    criticality?: string;
    os?: string;
    status?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<PagedResponse<Server>> => {
    const res = await apiClient.get<PagedResponse<Server>>('/servers', { params });
    return res.data;
  },

  getAllServersList: async (): Promise<Server[]> => {
    const res = await apiClient.get<Server[]>('/servers/all');
    return res.data;
  },

  getServerById: async (id: number): Promise<Server> => {
    const res = await apiClient.get<Server>(`/servers/${id}`);
    return res.data;
  },

  getServerDetail: async (id: number): Promise<ServerDetail> => {
    const res = await apiClient.get<ServerDetail>(`/servers/${id}/detail`);
    return res.data;
  },

  createServer: async (data: ServerCreateRequest): Promise<Server> => {
    const res = await apiClient.post<Server>('/servers', data);
    return res.data;
  },

  updateServer: async (id: number, data: Partial<ServerCreateRequest>): Promise<Server> => {
    const res = await apiClient.put<Server>(`/servers/${id}`, data);
    return res.data;
  },

  deleteServer: async (id: number): Promise<void> => {
    await apiClient.delete(`/servers/${id}`);
  },

  importCsv: async (file: File): Promise<ImportSummary> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ImportSummary>('/servers/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  exportCsvUrl: (): string => {
    return `${apiClient.defaults.baseURL}/servers/export`;
  },

  getOperatingSystems: async (): Promise<string[]> => {
    const res = await apiClient.get<string[]>('/servers/meta/operating-systems');
    return res.data;
  },

  getApplicationTypes: async (): Promise<string[]> => {
    const res = await apiClient.get<string[]>('/servers/meta/application-types');
    return res.data;
  },
};
