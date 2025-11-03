import { createContext, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ModalContext } from './ModalContext';
import { PromptModal } from '../reusable_components/PromptModal';
import useAuthStore from './zustands/AuthStore';
import { toast } from 'sonner';
export const UltilityContext_1 = createContext();

export default function UltilityContextProvider_1({ children }) {
  const navigate = useNavigate();
  const { openModal } = useContext(ModalContext);
  const authStore = useAuthStore();
  const convenience_1 = () => {
    openModal({
      modalContent: (
        <PromptModal
          line1={'\nBạn không có quyền thực hiện thao tác này!'}
          line2={'Vui lòng đăng nhập lại!'}
          onClose={() => navigate('/auth')}
        />
      ),
      disableBackdropClose: true,
    });
    authStore.signOut();
  };
  const showToastMessageInLocalStorage = () => {
    const message = localStorage.getItem('toastMessage');
    const state = localStorage.getItem('toastState');
    if (message) {
      if (state === 'success') {
        setTimeout(() => {
          toast.success(message);
        }, 50);
      } else if (state === 'error') {
        setTimeout(() => {
          toast.error(message);
        }, 50);
      } else {
        setTimeout(() => {
          toast(message);
        }, 50);
      }
      localStorage.removeItem('toastMessage');
      localStorage.removeItem('toastState');
    }
  };
  const storeToastMessageInLocalStorage = (message, state) => {
    localStorage.setItem('toastMessage', message);
    localStorage.setItem('toastState', state);
  };
  return (
    <UltilityContext_1.Provider
      value={{
        convenience_1,
        showToastMessageInLocalStorage,
        storeToastMessageInLocalStorage,
      }}
    >
      {children}
    </UltilityContext_1.Provider>
  );
}
