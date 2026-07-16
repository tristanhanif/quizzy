import api from './api';
import type { ApiResponse, LeaderboardEntry, Result, SubmitResultPayload } from '@/types';

export const resultService = {
  async submit(payload: SubmitResultPayload): Promise<ApiResponse<{ id: string; message: string }>> {
    const { data } = await api.post('/results', payload);
    return data;
  },

  async getLeaderboard(sessionId: string, limit?: number): Promise<ApiResponse<{ data: LeaderboardEntry[] }>> {
    const params = limit ? `?limit=${limit}` : '';
    const { data } = await api.get(`/results/leaderboard/${sessionId}${params}`);
    return data;
  },

  async getSessionResults(sessionId: string): Promise<ApiResponse<{ data: Result[] }>> {
    const { data } = await api.get(`/results/session/${sessionId}`);
    return data;
  },

  async getUserResults(userId: string): Promise<ApiResponse<{ data: Result[] }>> {
    const { data } = await api.get(`/results/user/${userId}`);
    return data;
  },

  async findOne(id: string): Promise<ApiResponse<Result>> {
    const { data } = await api.get(`/results/${id}`);
    return data;
  },
};
