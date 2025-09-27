import { useNotifications } from '../../context/NotificationContext';
import './Toast.css';

const Toast = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {notifications.map(({ id, type, title, message }) => (
        <div key={id} className={`toast toast--${type}`}>
          <div className="toast__content">
            <strong>{title}</strong>
            {message && <p>{message}</p>}
          </div>
          <button type="button" onClick={() => removeNotification(id)} aria-label="Dismiss notification">
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
