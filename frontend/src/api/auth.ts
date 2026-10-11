import { apiClient } from './client';
import { AuthResponse, User } from '../types';

export const authApi = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', { username, password });
    return res.data;
  },
  getCurrentUser: async (): Promise<User> => {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },
};
