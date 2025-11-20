import { axiosClient_Backend } from "./apiClient";

export const productApi = {
  createNewProduct: async (productData) => {
    return await axiosClient_Backend.post("/product", productData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
