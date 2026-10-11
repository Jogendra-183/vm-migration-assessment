import { apiClient } from './client';
import { Application, Dependency, DependencyGraph, ServerTelemetry, PerformanceMetric } from '../types';

export const applicationsApi = {
  getAll: async (): Promise<Application[]> => {
    const res = await apiClient.get<Application[]>('/applications');
    return res.data;
  },
  getById: async (id: number): Promise<Application> => {
    const res = await apiClient.get<Application>(`/applications/${id}`);
    return res.data;
  },
  create: async (data: Partial<Application>): Promise<Application> => {
    const res = await apiClient.post<Application>('/applications', data);
    return res.data;
  },
  update: async (id: number, data: Partial<Application>): Promise<Application> => {
    const res = await apiClient.put<Application>(`/applications/${id}`, data);
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/applications/${id}`);
  },
};

export const dependenciesApi = {
  getAll: async (): Promise<Dependency[]> => {
    const res = await apiClient.get<Dependency[]>('/dependencies');
    return res.data;
  },
  getByServer: async (serverId: number): Promise<Dependency[]> => {
    const res = await apiClient.get<Dependency[]>(`/dependencies/server/${serverId}`);
    return res.data;
  },
  getGraph: async (): Promise<DependencyGraph> => {
    const res = await apiClient.get<DependencyGraph>('/dependencies/graph');
    return res.data;
  },
  create: async (data: { sourceServerId: number; targetServerId: number; dependencyType: string; criticality: string; description?: string }): Promise<Dependency> => {
    const res = await apiClient.post<Dependency>('/dependencies', data);
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/dependencies/${id}`);
  },
};

export const performanceApi = {
  getTelemetry: async (serverId: number): Promise<ServerTelemetry> => {
    const res = await apiClient.get<ServerTelemetry>(`/performance/${serverId}`);
    return res.data;
  },
  addMetric: async (data: { serverId: number; cpuUtilization: number; ramUtilization: number; storageUtilization: number; networkUtilization: number }): Promise<PerformanceMetric> => {
    const res = await apiClient.post<PerformanceMetric>('/performance', data);
    return res.data;
  },
};
