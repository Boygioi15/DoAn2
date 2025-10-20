import { createContext, useState } from 'react';
import { createPortal } from 'react-dom';

export const ModalContext = createContext();

export default function ModalContextProvider({ children }) {
  const [modalContent, setModalContent] = useState(null);
  const openModal = (modalContent) => {
    setModalContent(modalContent);
  };
  const closeModal = () => {
    setModalContent(null);
  };
  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {modalContent &&
        createPortal(
          <div className="modal-backdrop" onClick={closeModal}>
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
