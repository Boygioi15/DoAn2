import { createContext, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ModalContext } from './ModalContext';
import { PromptModal } from '../reusable_components/PromptModal';
export const UltilityContext_1 = createContext();

export default function UltilityContextProvider_1({ children }) {
  const navigate = useNavigate();
  const { openModal } = useContext(ModalContext);
  const handleUnauthorizedAction = () => {
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
  };
  return (
    <UltilityContext_1.Provider value={{ handleUnauthorizedAction }}>
      {children}
    </UltilityContext_1.Provider>
  );
}
