import { apiClient } from './client';
import { ServerRisk, RiskMatrix } from '../types';

export const riskApi = {
  getAllRisks: async (): Promise<ServerRisk[]> => {
    const res = await apiClient.get<ServerRisk[]>('/risks');
    return res.data;
  },

  getRiskMatrix: async (): Promise<RiskMatrix> => {
    const res = await apiClient.get<RiskMatrix>('/risks/matrix');
    return res.data;
  },

  getServerRisk: async (serverId: number): Promise<ServerRisk> => {
    const res = await apiClient.get<ServerRisk>(`/risks/${serverId}`);
    return res.data;
  },
};
