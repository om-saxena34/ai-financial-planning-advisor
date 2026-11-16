import api from './api';

export const statementService = {
  uploadStatement: async (file) => {
    const formData = new FormData();
    formData.append('statement', file);
    const res = await api.post('/statement/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  confirmUpload: async (batchId, rows) => {
    const res = await api.post('/statement/confirm', { batchId, rows });
    return res.data;
  },

  correctCategory: async (keyword, category) => {
    const res = await api.post('/statement/correct', { keyword, category });
    return res.data;
  },

  deleteBatch: async (batchId) => {
    const res = await api.delete(`/statement/batch/${batchId}`);
    return res.data;
  },
};

export default statementService;
