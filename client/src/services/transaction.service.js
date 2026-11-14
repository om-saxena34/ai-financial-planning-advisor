import api from './api';

export const transactionService = {
  async getTransactions(params = {}) {
    const res = await api.get('/transactions', { params });
    return res.data;
  },

  async getSummary() {
    const res = await api.get('/transactions/summary');
    return res.data;
  },

  async createTransaction(txData) {
    const res = await api.post('/transactions', txData);
    return res.data;
  },

  async updateTransaction(id, txData) {
    const res = await api.put(`/transactions/${id}`, txData);
    return res.data;
  },

  async deleteTransaction(id) {
    const res = await api.delete(`/transactions/${id}`);
    return res.data;
  },

  async importCsv(formData) {
    const res = await api.post('/transactions/import-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async exportCsv() {
    const res = await api.get('/transactions/export-csv', {
      responseType: 'blob',
    });
    return res.data;
  },
};
