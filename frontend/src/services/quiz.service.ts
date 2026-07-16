import api from './api';
import type { ApiResponse, Quiz, CreateQuizPayload } from '@/types';

export const quizService = {
  async findAll(): Promise<ApiResponse<{ data: Quiz[] }>> {
    const { data } = await api.get('/quizzes');
    return data;
  },

  async findOne(id: string): Promise<ApiResponse<Quiz>> {
    const { data } = await api.get(`/quizzes/${id}`);
    return data;
  },

  async create(payload: CreateQuizPayload): Promise<ApiResponse<{ id: string; message: string }>> {
    const { data } = await api.post('/quizzes', payload);
    return data;
  },

  async update(id: string, payload: Partial<CreateQuizPayload>): Promise<ApiResponse<{ id: string; message: string }>> {
    const { data } = await api.put(`/quizzes/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<ApiResponse<{ message: string }>> {
    const { data } = await api.delete(`/quizzes/${id}`);
    return data;
  },

  async findByCreator(creatorId: string): Promise<ApiResponse<{ data: Quiz[] }>> {
    const { data } = await api.get(`/quizzes/creator/${creatorId}`);
    return data;
  },
};
