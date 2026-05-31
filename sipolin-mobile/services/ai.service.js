import api from './api';

export const aiService = {
  sendMessage: async (prompt) => {
    try {
      const response = await api.post('/ai/chat', {
        prompt,
      });

      return response.data;
    } catch (error) {
      console.log('AI Service Error:', error.response?.data || error.message);

      throw error;
    }
  },
};