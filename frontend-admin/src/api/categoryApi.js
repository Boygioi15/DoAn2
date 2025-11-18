import { axiosClient_Public } from "./apiClient";

const categoryApi = {
  getAllCategory: async () => {
    return await axiosClient_Public.get("/category");
  },
  createNewCategory: async (categoryData) => {
    return await axiosClient_Public.post("/category", categoryData);
  },
  updateCategory: async (categoryId, categoryData) => {
    return await axiosClient_Public.patch(
      `/category/${categoryId}`,
      categoryData
    );
  },
  deleteCategory: async (categoryId) => {
    return await axiosClient_Public.delete(`/category/${categoryId}`);
  },
};
export default categoryApi;
