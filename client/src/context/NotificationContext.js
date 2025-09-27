import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { nanoid } from 'nanoid';
import { useSocket } from './SocketContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { socket, isConnected, error } = useSocket();
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  }, []);

  const showNotification = useCallback(({ type = 'info', title, message, duration = 5000 }) => {
    const id = nanoid();
    setNotifications((current) => [
      ...current,
      {
        id,
        type,
        title,
        message,
        duration
      }
    ]);

    if (duration) {
      setTimeout(() => removeNotification(id), duration);
    }
  }, [removeNotification]);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  const value = useMemo(
    () => ({ notifications, showNotification, removeNotification, clearNotifications }),
    [notifications, showNotification, removeNotification, clearNotifications]
  );

  useEffect(() => {
    if (!socket || !isConnected) return;
    const handler = (payload) => {
      showNotification({
        type: payload.type || 'info',
        title: payload.title || 'Notification',
        message: payload.message
      });
    };

    socket.on('notification:new', handler);
    return () => {
      socket.off('notification:new', handler);
    };
  }, [socket, isConnected, showNotification]);

  useEffect(() => {
    if (!error) return;
    showNotification({
      type: 'error',
      title: 'Connection issue',
      message: 'We’re having trouble reaching the realtime service. Retrying…',
      duration: 7000
    });
  }, [error, showNotification]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => useContext(NotificationContext);
