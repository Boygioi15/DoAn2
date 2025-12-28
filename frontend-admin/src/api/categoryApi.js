import { axiosClient_Backend } from "./apiClient";

const categoryApi = {
  getAllCategory: async () => {
    return await axiosClient_Backend.get("/category");
  },
  createNewCategory: async (categoryData) => {
    return await axiosClient_Backend.post("/category", categoryData);
  },
  updateCategory: async (categoryId, categoryData) => {
    return await axiosClient_Backend.patch(
      `/category/${categoryId}`,
      categoryData
    );
  },
  deleteCategory: async (categoryId) => {
    return await axiosClient_Backend.delete(`/category/${categoryId}`);
  },
};
export default categoryApi;
