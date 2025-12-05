import { createContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';

export const ModalContext = createContext();

export default function ModalContextProvider({ children }) {
  const [modalContent, setModalContent] = useState(null);
  const [disableBackdropClose, setDisableBackdropClose] = useState(false);
  const [useDefaultX, setUseDefaultX] = useState(false);
  const navigate = useNavigate();
  const openModal = ({
    modalContent,
    disableBackdropClose = false,
    useDefaultX = false,
  }) => {
    document.body.style.overflow = 'hidden';
    setDisableBackdropClose(disableBackdropClose);
    setModalContent(modalContent);
    setUseDefaultX(useDefaultX);
    //console.log('Reached here');
  };
  const closeModal = () => {
    document.body.style.overflow = '';
    setDisableBackdropClose(false);
    setModalContent(null);
    setUseDefaultX(false);
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {modalContent &&
        createPortal(
          <div
            className="modal-backdrop"
            onClick={(e) => {
              e.stopPropagation();
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

              <button
                onClick={() => closeModal()}
                className="Escape_Button SMS_Modal_Escape_Button"
              >
                X
              </button>
            </div>
          </div>,
          document.body
        )}
    </ModalContext.Provider>
  );
}
