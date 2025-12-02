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
  getAllDirectChildrenOfCategory: async (categoryId) => {
    return await axiosClient_Backend.get(
      `category/direct-children/${categoryId}`
    );
  },
  getAllDirectChildrenOfCategoryWithImage: async (categoryId) => {
    return await axiosClient_Backend.get(
      `category/direct-children-img/${categoryId}`
    );
  },
};
