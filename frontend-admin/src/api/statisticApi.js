import { axiosClient_Backend } from "./apiClient";

const statisticApi = {
  getOverviewStatistics: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return await axiosClient_Backend.get(
      `/statistic/overview?${params.toString()}`
    );
  },

  getRevenueStatistics: async (period, startDate, endDate) => {
    const params = new URLSearchParams();
    if (period) params.append("period", period);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return await axiosClient_Backend.get(
      `/statistic/revenue?${params.toString()}`
    );
  },

  getOrderStatistics: async (period, startDate, endDate) => {
    const params = new URLSearchParams();
    if (period) params.append("period", period);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return await axiosClient_Backend.get(
      `/statistic/orders?${params.toString()}`
    );
  },

  getProductStatistics: async (limit = 10) => {
    return await axiosClient_Backend.get(`/statistic/products?limit=${limit}`);
  },

  getCategoryStatistics: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return await axiosClient_Backend.get(
      `/statistic/categories?${params.toString()}`
    );
  },

  getUserStatistics: async (period, startDate, endDate) => {
    const params = new URLSearchParams();
    if (period) params.append("period", period);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return await axiosClient_Backend.get(
      `/statistic/users?${params.toString()}`
    );
  },
};

export default statisticApi;
