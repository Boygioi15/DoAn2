import { createContext, useState } from 'react';
import { createPortal } from 'react-dom';

export const ModalContext = createContext();

export default function ModalContextProvider({ children }) {
  const [modalContent, setModalContent] = useState(null);
  const [disableBackdropClose, setDisableBackdropClose] = useState(false);
  const openModal = ({ modalContent, disableBackdropClose = false }) => {
    setDisableBackdropClose(disableBackdropClose);
    setModalContent(modalContent);
  };
  const closeModal = () => {
    setDisableBackdropClose(false);
    setModalContent(null);
  };
  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {modalContent &&
        createPortal(
          <div
            className="modal-backdrop"
            onClick={() => {
              if (!disableBackdropClose) {
                closeModal();
              }
            }}
          >
            <div
              className="modal-base"
              onClick={(e) => e.stopPropagation()} // stop click bubbling up/ Because it can cause the modal to collapse!
            >
              {modalContent}
            </div>
          </div>,
          document.body
        )}
    </ModalContext.Provider>
  );
}
