import api from './api';
import type { ApiResponse, UserProfile, MutualStatus, MutualUser } from '@/types';

export const userService = {
  async searchByDisplayId(displayId: string): Promise<ApiResponse<UserProfile>> {
    const { data } = await api.get(`/users/search/${encodeURIComponent(displayId)}`);
    return data;
  },

  async getUserProfile(displayId: string): Promise<ApiResponse<UserProfile>> {
    const { data } = await api.get(`/users/profile/${encodeURIComponent(displayId)}`);
    return data;
  },

  async sendMutualRequest(targetDisplayId: string): Promise<ApiResponse<{ id: string; message: string }>> {
    const { data } = await api.post('/users/mutual', { targetDisplayId });
    return data;
  },

  async acceptMutualRequest(mutualId: string): Promise<ApiResponse<{ message: string }>> {
    const { data } = await api.post('/users/mutual/accept', { mutualId });
    return data;
  },

  async declineMutualRequest(mutualId: string): Promise<ApiResponse<{ message: string }>> {
    const { data } = await api.post('/users/mutual/decline', { mutualId });
    return data;
  },

  async removeMutual(mutualId: string): Promise<ApiResponse<{ message: string }>> {
    const { data } = await api.delete(`/users/mutual/${mutualId}`);
    return data;
  },

  async getMutualStatus(targetUserId: string): Promise<ApiResponse<MutualStatus>> {
    const { data } = await api.get(`/users/mutual/status/${targetUserId}`);
    return data;
  },

  async getMyMutuals(): Promise<ApiResponse<{ data: MutualUser[] }>> {
    const { data } = await api.get('/users/mutual/list');
    return data;
  },

  async getPendingMutuals(): Promise<ApiResponse<{ data: any[] }>> {
    const { data } = await api.get('/users/mutual/pending');
    return data;
  },

  async getMutualCount(userId: string): Promise<ApiResponse<{ count: number }>> {
    const { data } = await api.get(`/users/mutual/count/${userId}`);
    return data;
  },

  async updateProfile(payload: { fullName?: string; picture?: string }): Promise<ApiResponse<UserProfile>> {
    const { data } = await api.patch('/users/profile', payload);
    return data;
  },
};
