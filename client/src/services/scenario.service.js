import api from './api';

export const scenarioService = {
  listScenarios: async () => {
    const res = await api.get('/scenarios');
    return res.data;
  },

  saveScenario: async (name, params) => {
    const res = await api.post('/scenarios', { name, params });
    return res.data;
  },

  deleteScenario: async (id) => {
    const res = await api.delete(`/scenarios/${id}`);
    return res.data;
  },

  simulateLive: async (params) => {
    const res = await api.post('/scenarios/simulate', params);
    return res.data;
  },
};

export default scenarioService;
