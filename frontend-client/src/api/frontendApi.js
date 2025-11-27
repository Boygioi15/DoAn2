import { axiosClient_Backend } from './apiClient';

export const frontendApi = {
  getCategoryData: async () => {
    return await axiosClient_Backend.get(
      '/frontend-setting/toplayout-category-data'
    );
  },
  getHomepageBanner: async () => {
    return await axiosClient_Backend.get('/frontend-setting/homepage-banner');
  },
  getTopLayoutRotatorMessage: async () => {
    return await axiosClient_Backend.get(
      '/frontend-setting/toplayout-rotator-message'
    );
  },
};
