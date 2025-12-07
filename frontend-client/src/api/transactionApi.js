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
  beginTransaction: async (cartId, formData) => {
    return await axiosClient_Backend.post('/transaction/confirm-transaction', {
      cartItemList: formData.cartItemList,
      detailPayment: formData.detailPayment,
      addressInfo: formData.addressInfo,
      cartId,
    });
  },
};
