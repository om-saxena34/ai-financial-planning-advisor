import api from './api';

const GUEST_KEY = 'finwise_guest_id';

function getGuestId() {
  let guestId = localStorage.getItem(GUEST_KEY);
  if (!guestId) {
    guestId = 'guest_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem(GUEST_KEY, guestId);
  }
  return guestId;
}

export const chatbotService = {
  async sendMessage(message) {
    const token = localStorage.getItem('accessToken');
    const payload = { message };
    if (!token) {
      payload.guestId = getGuestId();
    }
    const res = await api.post('/chatbot/message', payload);
    return res.data;
  },

  async getHistory() {
    const token = localStorage.getItem('accessToken');
    const params = !token ? { guestId: getGuestId() } : {};
    const res = await api.get('/chatbot/history', { params });
    return res.data;
  },

  async clearHistory() {
    const token = localStorage.getItem('accessToken');
    const params = !token ? { guestId: getGuestId() } : {};
    const res = await api.delete('/chatbot/history', { params });
    return res.data;
  },

  async getSuggestions() {
    const res = await api.get('/chatbot/suggestions');
    return res.data;
  },
};
