import { useContext } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ModalContext } from '../ModalContext';
import authApi from '@/api/authApi';
import { anonymousCartApi, cartApi } from '@/api/cartApi';
import useAuthStore from './AuthStore';
import { anonymousTransactionApi, transactionApi } from '@/api/transactionApi';

const useCartStore = create(
  persist(
    (set, get) => ({
      cartItemList: null,
      totalItem: -1,
      cashoutPrice: -1,
      cartId: '',
      userId: null,
      sheetOpen: false,
      allowedToPurchase: false,
      allSelected: false,
      totalSelected: -1,
      setTotalItem: (totalItem) => set({ totalItem }),
      setCashoutPrice: (cashoutPrice) => set({ cashoutPrice }),
      setCartId: (cartId) => set({ cartId }),
      setSheetOpen: (sheetOpen) => set({ sheetOpen }),
      setAllowedToPurcase: (allowedToPurchase) => set({ allowedToPurchase }),
      setAllSelected: (allSelected) => set({ allSelected }),
      setTotalSelected: (totalSelected) => set({ totalSelected }),
      setTotalSelected: (userId) => set({ userId }),

      getCartData: async () => {
        const authStore = useAuthStore.getState();
        try {
          let response;
          if (!authStore.accessToken) {
            const cartId = await get().cartId;
            console.log('CI: ', cartId);
            response = await anonymousCartApi.getCartDetail(cartId);
          } else {
            response = await cartApi.getCartDetail();
          }
          set((state) => ({
            cartId: response.data.cartId,
            totalItem: response.data.totalItem,
            cashoutPrice: response.data.cashoutPrice,
            cartItemList: response.data.cartItemList,
            allowedToPurchase: response.data.allowedToPurchase,
            allSelected: response.data.allSelected,
            totalSelected: response.data.totalSelected,
            userId: response.data.userId,
          }));
        } catch (error) {
          //console.log('E: ', error);
          await get().clearCart();
          throw error;
        }
      },
      mergeCartOfUserWithAnonymous: async () => {
        try {
          const anonymousCartId = await get().cartId;
          const response1 = await cartApi.mergeCartOfAnonymousToUser(
            anonymousCartId
          );
          const newCart = await get().getCartData();
        } catch (error) {
          console.log('E: ', error);
          await get().clearCart();
          throw error;
        }
      },
      addItemToCart: async (addData) => {
        const authStore = useAuthStore.getState();
        try {
          let res;
          if (!authStore.accessToken) {
            const cartId = await get().cartId;
            if (cartId)
              res = await anonymousCartApi.addNewItemToCart(cartId, addData);
            else res = await anonymousCartApi.addNewItemToCart(null, addData);
          } else {
            res = await cartApi.addNewItemToCart(addData);
          }
          await set((state) => ({
            cartId: res.data.cartId,
          }));
        } catch (err) {
          console.log('E: ', err);
          await get().clearCart();
          throw err;
        }
      },
      updateCartItemQuantity: async (cartItemId, newQuantity) => {
        const authStore = useAuthStore.getState();
        try {
          let res;
          if (!authStore.accessToken) {
            res = await anonymousCartApi.updateCartItemQuantity({
              cartItemId,
              newQuantity,
            });
          } else {
            res = await cartApi.updateCartItemQuantity({
              cartItemId,
              newQuantity,
            });
          }
        } catch (err) {
          //console.log('E: ', error);
          this.get().clearCart();
          throw err;
        }
      },
      updateCartItemSelected: async (cartItemId, selected) => {
        const authStore = useAuthStore.getState();
        try {
          let res;
          if (!authStore.accessToken) {
            res = await anonymousCartApi.updateCartItemSelected(
              cartItemId,
              selected
            );
          } else {
            res = await cartApi.updateCartItemSelected(cartItemId, selected);
          }
        } catch (err) {
          //console.log('E: ', error);
          this.get().clearCart();
          throw err;
        }
      },
      updateCartSelected: async (selected) => {
        const authStore = useAuthStore.getState();
        try {
          let res;
          if (!authStore.accessToken) {
            res = await anonymousCartApi.updateCartSelected(
              await get().cartId,
              selected
            );
          } else {
            res = await cartApi.updateCartSelected({
              selected,
            });
          }
        } catch (err) {
          // console.log('E: ', err);
          this.get().clearCart();
          throw err;
        }
      },
      deleteCartItem: async (cartItemId) => {
        const authStore = useAuthStore.getState();
        try {
          let res;
          if (!authStore.accessToken) {
            await anonymousCartApi.deleteCartItem(cartItemId);
          } else {
            res = await cartApi.deleteCartItem(cartItemId);
          }
        } catch (err) {
          console.log('E: ', err);
          this.get().clearCart();
          throw err;
        }
      },
      clearCart: () =>
        set({
          cartItemList: null,
          totalItem: -1,
          cashoutPrice: -1,
          cartId: '',
          sheetOpen: false,
          allowedToPurchase: false,
        }),
    }),
    {
      name: 'cart-storage', // key in localStorage
    }
  )
);
export default useCartStore;
