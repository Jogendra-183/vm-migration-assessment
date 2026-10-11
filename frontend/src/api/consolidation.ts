import { apiClient } from './client';
import { ConsolidationPlan } from '../types';

export const consolidationApi = {
  getLatestPlan: async (): Promise<ConsolidationPlan> => {
    const res = await apiClient.get<ConsolidationPlan>('/consolidation');
    return res.data;
  },

  calculateCustom: async (customParams: { customHostVcpu?: number; customHostRamGb?: number; customHostStorageGb?: number }): Promise<ConsolidationPlan> => {
    const res = await apiClient.post<ConsolidationPlan>('/consolidation/calculate', customParams);
    return res.data;
  },
};
