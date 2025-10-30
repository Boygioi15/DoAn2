import { axiosClient } from './apiClient';

const userApi = {
  getAccountInfo: async () => {
    return await axiosClient.get('/user/account-info');
  },
  updateAccountInfo: () => {},
  updateUserPassword: () => {},
};
export default userApi;
