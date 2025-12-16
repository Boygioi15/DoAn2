import { axiosClient_Backend } from './apiClient';

export const transactionApi = {
  getTransactionDetailAndUpdateCart: async () => {
    return await axiosClient_Backend.get('/transaction/transaction-detail');
  },
  beginTransaction: async (formData) => {
    return await axiosClient_Backend.post(
      '/transaction/confirm-transaction',
      formData
    );
  },
  cancelOrder: async (orderId) => {
    return await axiosClient_Backend.post('/transaction/callback/browser', {
      orderId: orderId,
    });
  },
};
export const anonymousTransactionApi = {
  getTransactionDetailAndUpdateCart: async (cartId) => {
    return await axiosClient_Backend.post(
      `/anonymous-transaction/transaction-detail`,
      {
        cartId,
      }
    );
  },
  beginTransaction: async (formData) => {
    return await axiosClient_Backend.post(
      '/anonymous-transaction/confirm-transaction',
      formData
    );
  },
};
