import { axiosClient_Backend } from './apiClient';

export const chatApi = {
  /**
   * Send a message to the chatbot
   * @param {string} message - User message
   * @param {Array} conversationHistory - Previous conversation messages
   * @returns {Promise} Response with reply and updated conversation history
   */
  sendMessage: async (message, conversationHistory = []) => {
    return await axiosClient_Backend.post(
      '/chat',
      {
        message,
        conversationHistory,
      },
      { timeout: 60000 }
    );
  },
};
