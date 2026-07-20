import api from './api';

export const adminService = {
  async getAllUsers() {
    const response = await api.get('/admin/users');
    return response.data;
  },

  async getStats() {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  async updateUserRole(userId: string, role: string) {
    const response = await api.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  async getAllQuizzes() {
    const response = await api.get('/admin/quizzes');
    return response.data;
  },

  async forceDeleteQuiz(quizId: string) {
    const response = await api.delete(`/admin/quizzes/${quizId}`);
    return response.data;
  },

  async deleteUser(userId: string) {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  async getMaintenanceMode() {
    const response = await api.get('/admin/maintenance');
    return response.data;
  },

  async toggleMaintenanceMode(enabled: boolean) {
    const response = await api.post('/admin/maintenance', { enabled });
    return response.data;
  },

  async getActiveSessions() {
    const response = await api.get('/admin/active-sessions');
    return response.data;
  },

  async sendBroadcast(message: string) {
    const response = await api.post('/admin/broadcast', { message });
    return response.data;
  },

  async getBroadcast() {
    const response = await api.get('/admin/broadcast');
    return response.data;
  },

  async clearBroadcast() {
    const response = await api.delete('/admin/broadcast');
    return response.data;
  },
};
