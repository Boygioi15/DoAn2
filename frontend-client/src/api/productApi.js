import { axiosClient_Backend } from './apiClient';

export const productApi = {
  getAllProduct: async () => {
    return await axiosClient_Backend.get('product/client');
  },
  getProductDetail: async (productId) => {
    return await axiosClient_Backend.get(
      `product/get-detail/client/${productId}`
    );
  },
};
