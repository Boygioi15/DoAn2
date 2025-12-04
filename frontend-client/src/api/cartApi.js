import { axiosClient_Backend } from './apiClient';

export const cartApi = {
  getCartDetail: async () => {
    return await axiosClient_Backend.get('cart/cart-detail');
  },
  addNewItemToCart: async (addItemData) => {
    return await axiosClient_Backend.post('cart/add-item', addItemData);
  },
  updateCartItemQuantity: async (updateQuantityData) => {
    return await axiosClient_Backend.patch(
      'cart/update-quantity',
      updateQuantityData
    );
  },
  deleteCartItem: async (cartItemId) => {
    return await axiosClient_Backend.patch(`item/${cartItemId}`);
  },
};
