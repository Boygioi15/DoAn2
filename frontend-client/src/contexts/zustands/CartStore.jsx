import { useContext } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ModalContext } from '../ModalContext';
import authApi from '@/api/authApi';
import { cartApi } from '@/api/cartApi';

const useCartStore = create(
  persist(
    (set, get) => ({
      cartItemList: [],
      totalItem: 0,
      cashoutPrice: 0,
      cartId: '',

      setTotalItem: (totalItem) => set({ totalItem }),
      setCashoutPrice: (cashoutPrice) => set({ cashoutPrice }),
      setCartId: (cartId) => set({ cartId }),

      getCartData: async () => {
        try {
          const response = await cartApi.getCartDetail();
          set((state) => ({
            cartId: response.data.cartId,
            totalItem: response.data.totalItem,
            cashoutPrice: response.data.cashoutPrice,
            cartItemList: response.data.cartItemList,
          }));
        } catch (error) {
          console.log(error);
        }
      },
      addItemToCart: async (addData) => {
        try {
          const res = await cartApi.addNewItemToCart(addData);
          const newCart = await cart;
          // server returns updated cart or new item snapshot
          set(() => ({
            cart: [...state.cart, res.data.item],
            loading: false,
          }));
        } catch (err) {
          console.error('Add to cart failed:', err);
        }
      },
      clearCart: () => set({ phone: '', accessToken: '' }),
    }),
    {
      name: 'cart-storage', // key in localStorage
    }
  )
);
export default useCartStore;
