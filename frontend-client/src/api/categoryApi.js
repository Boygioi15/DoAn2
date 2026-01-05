import { axiosClient_Backend } from './apiClient';

export const categoryApi = {
  getCategoryLandingPage: async (categoryId) => {
    return await axiosClient_Backend.get(`category/${categoryId}/landing`);
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
