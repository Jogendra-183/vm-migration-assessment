import { apiClient } from './client';
import { VmRecommendation, VmRecommendationSummary } from '../types';

export const vmApi = {
  getAllRecommendations: async (): Promise<VmRecommendation[]> => {
    const res = await apiClient.get<VmRecommendation[]>('/vm-recommendations');
    return res.data;
  },

  getRecommendationByServerId: async (serverId: number): Promise<VmRecommendation> => {
    const res = await apiClient.get<VmRecommendation>(`/vm-recommendations/${serverId}`);
    return res.data;
  },

  getSummary: async (): Promise<VmRecommendationSummary> => {
    const res = await apiClient.get<VmRecommendationSummary>('/vm-recommendations/summary');
    return res.data;
  },
};
