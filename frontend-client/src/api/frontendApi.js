import { axiosClient_Backend } from './apiClient';

export const frontendApi = {
  getLayoutSetting: async () => {
    return await axiosClient_Backend.get('/frontend-setting/setting/layout');
  },
  getHomepageSetting: async () => {
    return await axiosClient_Backend.get('/frontend-setting/setting/homepage');
  },
  getFrontendPage: async (url) => {
    return await axiosClient_Backend.get(`/frontend-setting/page${url}`);
  },
};
