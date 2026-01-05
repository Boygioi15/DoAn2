import { axiosClient_Backend } from './apiClient';

export const speechApi = {
  /**
   * Convert speech audio to text
   * @param {Object} data - Speech data
   * @param {string} data.audioData - Base64 encoded audio data
   * @param {string} data.language - Language code (e.g., 'vi-VN', 'en-US')
   * @param {string} data.mimeType - Audio mime type (e.g., 'audio/webm')
   * @returns {Promise} Response with transcript
   */
  speechToText: async (data) => {
    return await axiosClient_Backend.post('/speech/to-text', data);
  },
};
