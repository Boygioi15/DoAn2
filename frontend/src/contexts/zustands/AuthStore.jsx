import { useContext } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ModalContext } from '../ModalContext';

const useAuthStore = create(
  persist(
    (set) => ({
      phone: '',
      setPhone: (phone) => set({ phone }),

      accessToken: '',
      setAccessToken: (token) => set({ accessToken: token }),

      refreshToken: '',
      setRefreshToken: (token) => set({ refreshToken: token }),

      signOut: () => {
        set({
          phone: '',
          accessToken: '',
          refreshToken: '',
        });
      },
      clearAuth: () => set({ phone: '', accessToken: '' }),
    }),
    {
      name: 'auth-storage', // key in localStorage
    }
  )
);
export default useAuthStore;
