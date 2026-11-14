import api from './api';

export const predictionService = {
  async classify(manualFeatures = null) {
    const res = await api.post('/predictions/classify', manualFeatures || {});
    return res.data;
  },

  async forecast(manualFeatures = null) {
    const res = await api.post('/predictions/forecast', manualFeatures || {});
    return res.data;
  },

  async getHistory(type = null, limit = 10) {
    const res = await api.get('/predictions/history', {
      params: { type, limit },
    });
    return res.data;
  },

  async getMetrics() {
    const res = await api.get('/ml-metrics');
    return res.data;
  },
};
