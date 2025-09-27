import { createPortal } from 'react-dom';
import Button from './Button';
import './Modal.css';

const Modal = ({ isOpen, title, children, onClose, actions = [] }) => {
  if (!isOpen) return null;
  return createPortal(
    <div className="modal">
      <div className="modal__backdrop" aria-hidden="true" onClick={onClose} />
      <div className="modal__dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header className="modal__header">
          <h2 id="modal-title">{title}</h2>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div className="modal__body">{children}</div>
        {!!actions.length && (
          <footer className="modal__footer">
            {actions.map((action) => (
              <Button key={action.label} {...action}>
                {action.label}
              </Button>
            ))}
          </footer>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
