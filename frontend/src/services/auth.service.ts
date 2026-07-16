import api from './api';
import type { ApiResponse, AuthResponse, LoginPayload, RegisterPayload, User } from '@/types';

export const authService = {
  async register(payload: RegisterPayload): Promise<ApiResponse<AuthResponse>> {
    const { data } = await api.post('/auth/register', payload);
    return data;
  },

  async login(payload: LoginPayload): Promise<ApiResponse<AuthResponse>> {
    const { data } = await api.post('/auth/login', payload);
    return data;
  },

  async getProfile(): Promise<ApiResponse<User>> {
    const { data } = await api.get('/auth/profile');
    return data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },
};
