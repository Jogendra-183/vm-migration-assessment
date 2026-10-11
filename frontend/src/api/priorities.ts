import { apiClient } from './client';
import { ServerPriority, MigrationPriority } from '../types';

export const priorityApi = {
  getAllPriorities: async (): Promise<ServerPriority[]> => {
    const res = await apiClient.get<ServerPriority[]>('/migration-priority');
    return res.data;
  },

  overridePriority: async (serverId: number, priority: MigrationPriority, overrideReason?: string): Promise<ServerPriority> => {
    const res = await apiClient.put<ServerPriority>(`/migration-priority/${serverId}`, { priority, overrideReason });
    return res.data;
  },
};
