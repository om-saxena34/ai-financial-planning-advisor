import api from './api';

export const healthScoreService = {
  async calculateScore() {
    const res = await api.get('/health-score');
    return res.data;
  },

  async recalculate() {
    const res = await api.post('/health-score/calculate');
    return res.data;
  },

  async getHistory() {
    const res = await api.get('/health-score/history');
    return res.data;
  },
};
