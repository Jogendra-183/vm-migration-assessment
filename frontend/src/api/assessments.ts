import { apiClient } from './client';
import { Assessment, AssessmentSummary, AssessmentRunResponse } from '../types';

export const assessmentApi = {
  runAssessment: async (): Promise<AssessmentRunResponse> => {
    const res = await apiClient.post<AssessmentRunResponse>('/assessment/run');
    return res.data;
  },

  getAllAssessments: async (): Promise<Assessment[]> => {
    const res = await apiClient.get<Assessment[]>('/assessment');
    return res.data;
  },

  getSummary: async (): Promise<AssessmentSummary> => {
    const res = await apiClient.get<AssessmentSummary>('/assessment/summary');
    return res.data;
  },

  getAssessmentByServerId: async (serverId: number): Promise<Assessment> => {
    const res = await apiClient.get<Assessment>(`/assessment/${serverId}`);
    return res.data;
  },

  assessSingleServer: async (serverId: number): Promise<Assessment> => {
    const res = await apiClient.post<Assessment>(`/assessment/server/${serverId}`);
    return res.data;
  },
};
