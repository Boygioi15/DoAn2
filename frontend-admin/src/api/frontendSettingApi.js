import { axiosClient_Backend } from "./apiClient";

const frontendSettingApi = {
  getFrontendPage: async (url) => {
    return await axiosClient_Backend.get(`frontend-setting/page/${url}`);
  },
  updateFrontendPage: async (url, content) => {
    return await axiosClient_Backend.patch(`frontend-setting/page/${url}`, {
      content,
    });
  },
};
export default frontendSettingApi;
