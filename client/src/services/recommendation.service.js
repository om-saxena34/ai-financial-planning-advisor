import api from './api';

export const recommendationService = {
  async getRecommendations() {
    const res = await api.get('/recommendations');
    return res.data;
  },

  async updateStatus(id, status) {
    const res = await api.patch(`/recommendations/${id}/status`, { status });
    return res.data;
  },
};
