import { axiosClient_Backend } from './apiClient';

export const imageApi = {
  /**
   * Search products by image
   * @param {Object} data - Image data
   * @param {string} data.imageData - Base64 encoded image data
   * @param {string} data.mimeType - Image mime type (e.g., 'image/jpeg', 'image/png')
   * @returns {Promise} Response with search results
   */
  searchByImage: async (data) => {
    return await axiosClient_Backend.post('/image/search', data);
  },

  /**
   * Upload image file for search
   * @param {File} imageFile - Image file to upload
   * @returns {Promise} Response with search results
   */
  uploadImage: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    return await axiosClient_Backend.post('/image/upload-search', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

