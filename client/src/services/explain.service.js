import api from './api';

export const explainService = {
  explainScore: async () => {
    const res = await api.get('/explain/score');
    return res.data;
  },

  explainRecommendation: async (recommendation) => {
    const res = await api.post('/explain/recommendation', recommendation);
    return res.data;
  },
};

export default explainService;
