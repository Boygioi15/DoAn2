import { axiosClient_Backend } from './apiClient';

export const cartApi = {
  getCartDetail: async () => {
    return await axiosClient_Backend.get('cart/cart-detail');
  },
  mergeCartOfAnonymousToUser: async (anonymousCartId) => {
    return await axiosClient_Backend.post('cart/merge-with-anonymous', {
      anonymousCartId,
    });
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
  updateCartItemSelected: async (cartItemId, selected) => {
    return await axiosClient_Backend.patch(`cart/item/select/${cartItemId}`, {
      selected,
    });
  },
  updateCartSelected: async (selected) => {
    return await axiosClient_Backend.patch(`cart/select`, selected);
  },
  deleteCartItem: async (cartItemId) => {
    return await axiosClient_Backend.delete(`cart/item/${cartItemId}`);
  },
};

export const anonymousCartApi = {
  getCartDetail: async (cartId) => {
    return await axiosClient_Backend.post('cart-anonymous/cart-detail', {
      cartId,
    });
  },
  addNewItemToCart: async (cartId, addItemData) => {
    return await axiosClient_Backend.post('cart-anonymous/add-item', {
      productId: addItemData.productId,
      variantId: addItemData.variantId,
      cartId,
    });
  },
  updateCartItemQuantity: async (updateQuantityData) => {
    return await axiosClient_Backend.patch(
      'cart-anonymous/update-quantity',
      updateQuantityData
    );
  },
  updateCartItemSelected: async (cartItemId, selected) => {
    return await axiosClient_Backend.patch(
      `cart-anonymous//item/select/${cartItemId}`,
      {
        selected,
      }
    );
  },
  updateCartSelected: async (cartId, selected) => {
    return await axiosClient_Backend.patch(`cart-anonymous/select`, {
      selected,
      cartId,
    });
  },
  deleteCartItem: async (cartItemId) => {
    return await axiosClient_Backend.delete(
      `cart-anonymous/item/${cartItemId}`
    );
  },
};
