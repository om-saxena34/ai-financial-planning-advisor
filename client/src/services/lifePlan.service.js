import api from './api';

export const lifePlanService = {
  async projectPlan(payload) {
    const res = await api.post('/plan/future/project', payload);
    return res.data;
  },

  async getReadiness() {
    const res = await api.get('/plan/future/readiness');
    return res.data;
  },

  async getSavedPlan() {
    const res = await api.get('/plan/future/saved');
    return res.data;
  },

  async savePlan(payload) {
    const res = await api.post('/plan/future/save', payload);
    return res.data;
  },
};
