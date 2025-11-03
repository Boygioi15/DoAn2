import { axiosClient_Backend } from "./apiClient";

const userApi = {
  getAllUsers: async () => {
    return await axiosClient_Backend.get("/user");
  },
};
export default userApi;
