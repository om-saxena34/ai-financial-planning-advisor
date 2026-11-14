import api from './api';

export const goalService = {
  async getGoals(params = {}) {
    const res = await api.get('/goals', { params });
    return res.data;
  },

  async getGoalById(id) {
    const res = await api.get(`/goals/${id}`);
    return res.data;
  },

  async createGoal(goalData) {
    const res = await api.post('/goals', goalData);
    return res.data;
  },

  async updateGoal(id, updateData) {
    const res = await api.put(`/goals/${id}`, updateData);
    return res.data;
  },

  async contributeToGoal(id, amount) {
    const res = await api.post(`/goals/${id}/contribute`, { amount });
    return res.data;
  },

  async deleteGoal(id) {
    const res = await api.delete(`/goals/${id}`);
    return res.data;
  },
};
