import api from '../utils/axiosinstance';

const aiService = {
  async listChats(topicId) { return (await api.get('/ai/chats', { params: topicId ? { topicId } : {} })).data.chats; },
  async getChat(chatId) { return (await api.get(`/ai/chats/${chatId}`)).data.chat; },
  async createChat(subjectId, topicId) { return (await api.post('/ai/chats', { subjectId, topicId })).data.chat; },
  async sendMessage(chatId, message, usePdf) { return (await api.post(`/ai/chats/${chatId}/messages`, { message, usePdf })).data.chat; }
};

export default aiService;
