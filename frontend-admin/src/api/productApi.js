import { axiosClient_Backend } from "./apiClient";

export const productApi = {
  createNewProduct: async (productData) => {
    return await axiosClient_Backend.post("/product", productData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
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
