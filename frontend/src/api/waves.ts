import { apiClient } from './client';
import { MigrationWave, MigrationWaveServer, WaveStatus } from '../types';

export const wavesApi = {
  getAllWaves: async (): Promise<MigrationWave[]> => {
    const res = await apiClient.get<MigrationWave[]>('/migration-waves');
    return res.data;
  },

  getWaveById: async (id: number): Promise<MigrationWave> => {
    const res = await apiClient.get<MigrationWave>(`/migration-waves/${id}`);
    return res.data;
  },

  assignServerToWave: async (serverId: number, waveId: number, notes?: string): Promise<MigrationWaveServer> => {
    const res = await apiClient.post<MigrationWaveServer>('/migration-waves/assign', { serverId, waveId, notes });
    return res.data;
  },

  updateWave: async (id: number, data: { waveName?: string; description?: string; status?: WaveStatus; plannedDate?: string }): Promise<MigrationWave> => {
    const res = await apiClient.put<MigrationWave>(`/migration-waves/${id}`, data);
    return res.data;
  },
};
