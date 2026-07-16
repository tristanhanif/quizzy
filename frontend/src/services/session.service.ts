import api from './api';
import type { ApiResponse, Session, CreateSessionPayload } from '@/types';

export const sessionService = {
  async create(payload: CreateSessionPayload): Promise<ApiResponse<{ sessionId: string; roomCode: string }>> {
    const { data } = await api.post('/sessions', payload);
    return data;
  },

  async join(roomCode: string): Promise<ApiResponse<{ isValid: boolean; sessionId: string; websocketUrl: string }>> {
    const { data } = await api.post('/sessions/join', { roomCode });
    return data;
  },

  async findOne(id: string): Promise<ApiResponse<Session>> {
    const { data } = await api.get(`/sessions/${id}`);
    return data;
  },

  async findByRoomCode(roomCode: string): Promise<ApiResponse<Session>> {
    const { data } = await api.get(`/sessions/room/${roomCode}`);
    return data;
  },

  async getParticipants(sessionId: string): Promise<ApiResponse<{ data: any[] }>> {
    const { data } = await api.get(`/sessions/${sessionId}/participants`);
    return data;
  },
};
