import { apiClient } from './client';
import { SystemSetting } from '../types';

export const settingsApi = {
  getAllSettings: async (): Promise<SystemSetting[]> => {
    const res = await apiClient.get<SystemSetting[]>('/settings');
    return res.data;
  },

  getCategorizedSettings: async (): Promise<{ categorizedSettings: Record<string, SystemSetting[]> }> => {
    const res = await apiClient.get<{ categorizedSettings: Record<string, SystemSetting[]> }>('/settings/categorized');
    return res.data;
  },

  updateSetting: async (settingKey: string, settingValue: string): Promise<SystemSetting> => {
    const res = await apiClient.put<SystemSetting>('/settings', { settingKey, settingValue });
    return res.data;
  },

  batchUpdate: async (settings: Record<string, string>): Promise<SystemSetting[]> => {
    const res = await apiClient.put<SystemSetting[]>('/settings/batch', { settings });
    return res.data;
  },
};
