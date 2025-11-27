import { axiosClient_Backend } from './apiClient';

export const productApi = {
  getAllProduct: async (query) => {
    return await axiosClient_Backend.get(`product/client?${query}`);
  },
  getProductDetail: async (productId) => {
    return await axiosClient_Backend.get(
      `product/get-detail/client/${productId}`
    );
  },
};
