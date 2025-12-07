import { axiosClient_Backend } from './apiClient';

const userApi = {
  getAccountInfo: async () => {
    return await axiosClient_Backend.get('/user/account-info');
  },
  updateAccountInfo: async (formData) => {
    return await axiosClient_Backend.post('/user/account-info', formData);
  },
  getAllUserAddress: async () => {
    return await axiosClient_Backend.get('/user/address');
  },
  getDefaultAddress: async () => {
    return await axiosClient_Backend.get('user/address-default');
  },
  createNewUserAddress: async (formData) => {
    return await axiosClient_Backend.post('/user/address', formData);
  },
  updateUserAddress: async (formData) => {
    return await axiosClient_Backend.patch('/user/address', formData);
  },
  deleteUserAddress: async (addressId) => {
    return await axiosClient_Backend.delete(`/user/address/${addressId}`);
  },
  setDefaultOfUserAddress: async (addressId) => {
    return await axiosClient_Backend.patch(
      `/user/address/set-default/${addressId}`
    );
  },
};
export default userApi;
