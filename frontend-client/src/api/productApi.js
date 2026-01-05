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
    if (!categoryId) {
      return await axiosClient_Backend.get(`category/direct-children-img`);
    }
    return await axiosClient_Backend.get(
      `category/direct-children-img/${categoryId}`
    );
  },
  searchByImage: async (imageFile, queryString) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return await axiosClient_Backend.post(
      `product/search-by-image?${queryString}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds for AI processing
      }
    );
  },
};
