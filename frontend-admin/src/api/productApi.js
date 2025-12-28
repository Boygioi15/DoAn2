import { axiosClient_Backend } from "./apiClient";

export const productApi = {
  publishNewProduct: async (productData) => {
    return await axiosClient_Backend.post(
      "/product/publish-new-product",
      productData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },
  createNewDraft: async (productData) => {
    return await axiosClient_Backend.post(
      `/product/create-new-draft`,
      productData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },
  updateDraft: async (productId, productData) => {
    return await axiosClient_Backend.patch(
      `/product/update-draft/${productId}`,
      productData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },
  publishDraft: async (productId, productData) => {
    return await axiosClient_Backend.patch(
      `/product/publish-draft/${productId}`,
      productData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },
  updateProduct: async (productId, productData) => {
    return await axiosClient_Backend.patch(
      `/product/update-product/${productId}`,
      productData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },
  getProductList: async (query) => {
    return await axiosClient_Backend.get(`/product/admin?${query}`);
  },
  getProductDetail_EditProduct: async (productId) => {
    return await axiosClient_Backend.get(
      `/product/get-detail/admin/${productId}`
    );
  },
  updateProductPublished: async (productId, state) => {
    return await axiosClient_Backend.post(
      `/product/update-published/${productId}`,
      { state }
    );
  },
  deleteProduct: async (productId) => {
    return await axiosClient_Backend.delete(`product/${productId}`);
  },
  restoreProduct: async (productId) => {
    return await axiosClient_Backend.post(`product/restore/${productId}`);
  },
};
