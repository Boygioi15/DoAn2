import { axiosClient_Backend } from "./apiClient";

const orderApi = {
  getOrderList: async (queryString) => {
    return await axiosClient_Backend.get(`/order?${queryString}`);
  },
};
export default orderApi;
