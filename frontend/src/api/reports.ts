import { apiClient } from './client';

export const reportsApi = {
  getSummary: async (): Promise<any> => {
    const res = await apiClient.get('/reports/summary');
    return res.data;
  },

  downloadPdf: async (): Promise<Blob> => {
    const res = await apiClient.get('/reports/pdf', { responseType: 'blob' });
    return res.data;
  },

  downloadExcel: async (): Promise<Blob> => {
    const res = await apiClient.get('/reports/excel', { responseType: 'blob' });
    return res.data;
  },
};
