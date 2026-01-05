import { axiosClient_Backend } from "./apiClient";

const orderApi = {
  getOrderList: async (queryString) => {
    return await axiosClient_Backend.get(`/order?${queryString}`);
  },
  updateOrderPaymentState: async (orderId, newState) => {
    return await axiosClient_Backend.post(`/order/${orderId}/payment`, {
      paymentState: newState,
    });
  },
  updateOrderDeliveryState: async (orderId, newState) => {
    return await axiosClient_Backend.post(`/order/${orderId}/delivery`, {
      deliveryState: newState,
    });
  },
};
export default orderApi;
