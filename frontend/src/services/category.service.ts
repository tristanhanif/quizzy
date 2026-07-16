import api from './api';
import type { ApiResponse, Category } from '@/types';

export const categoryService = {
  async findAll(): Promise<ApiResponse<{ data: Category[] }>> {
    const { data } = await api.get('/categories');
    return data;
  },

  async findOne(id: string): Promise<ApiResponse<Category>> {
    const { data } = await api.get(`/categories/${id}`);
    return data;
  },

  async create(payload: { name: string; description?: string; icon?: string }): Promise<ApiResponse<{ id: string; message: string }>> {
    const { data } = await api.post('/categories', payload);
    return data;
  },

  async update(id: string, payload: Partial<{ name: string; description: string; icon: string }>): Promise<ApiResponse<{ id: string; message: string }>> {
    const { data } = await api.put(`/categories/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<ApiResponse<{ message: string }>> {
    const { data } = await api.delete(`/categories/${id}`);
    return data;
  },
};
