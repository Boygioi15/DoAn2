import { useContext } from 'react';
import STOPHERE from '../assets/STOPHERE.jpg';
import { ModalContext } from '../contexts/ModalContext';
import { useNavigate } from 'react-router-dom';
export function PromptModal({ line1, line2, onClose }) {
  const { closeModal } = useContext(ModalContext);
  return (
    <div className="prompt-modal">
      <div className="prompt-modal-img-container">
        <img src={STOPHERE} className="prompt-modal-img" />
        <img src={STOPHERE} className="prompt-modal-img" />
        <img src={STOPHERE} className="prompt-modal-img" />
      </div>

      <div className="prompt-modal-text">
        {line1}
        <br />
        {line2}
      </div>
      <button
        onClick={() => {
          closeModal();
          onClose();
        }}
        style={{ width: '100%' }}
        className="button-standard-1"
      >
        Quay lại đăng nhập
      </button>
    </div>
  );
}
