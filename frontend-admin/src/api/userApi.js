import { axiosClient_Backend } from "./apiClient";

const userApi = {
  getAllUsers: async () => {
    return await axiosClient_Backend.get("/user");
  },
  banUser: async (userId) => {
    return await axiosClient_Backend.post(`/user/${userId}/ban`);
  },
  unbanUser: async (userId) => {
    return await axiosClient_Backend.post(`/user/${userId}/unban`);
  },
  getUserDetail: async (userId) => {
    return await axiosClient_Backend.get(`/user/${userId}/get-detail`);
  },
};
export default userApi;
