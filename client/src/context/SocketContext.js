import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';

const SocketContext = createContext();

const isBrowser = typeof window !== 'undefined';

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [state, setState] = useState({ socket: null, isConnected: false, error: null });

  useEffect(() => {
    if (!SOCKET_URL) {
      setState({ socket: null, isConnected: false, error: null });
      return () => {};
    }

    const instance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      autoConnect: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 1500,
      reconnectionDelayMax: 6000,
      timeout: 8000
    });

    socketRef.current = instance;

    const handleConnect = () => setState((prev) => ({ ...prev, isConnected: true, error: null }));
    const handleDisconnect = () => setState((prev) => ({ ...prev, isConnected: false }));
    const handleError = (err) => {
      setState((prev) => ({ ...prev, error: err }));
      if (!instance.active) return;
      instance.disconnect();
    };

    instance.on('connect', handleConnect);
    instance.on('disconnect', handleDisconnect);
    instance.on('connect_error', handleError);

    const connectIfOnline = () => {
      if (!isBrowser) return;
      if (!navigator.onLine) {
        setState((prev) => ({ ...prev, error: new Error('Offline'), isConnected: false }));
        return;
      }
      instance.connect();
      setState({ socket: instance, isConnected: instance.connected, error: null });
    };

    connectIfOnline();

    const handleOnline = () => {
      setState((prev) => ({ ...prev, error: null }));
      reconnectTimeoutRef.current = window.setTimeout(connectIfOnline, 250);
    };
    const handleOffline = () => {
      setState((prev) => ({ ...prev, isConnected: false, error: new Error('Offline') }));
      instance.disconnect();
    };

    if (isBrowser) {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      instance.off('connect', handleConnect);
      instance.off('disconnect', handleDisconnect);
      instance.off('connect_error', handleError);
      instance.disconnect();
      socketRef.current = null;
      if (isBrowser) {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      reconnect: () => {
        if (!socketRef.current) return;
        if (isBrowser && !navigator.onLine) {
          setState((prev) => ({ ...prev, error: new Error('Offline') }));
          return;
        }
        socketRef.current.connect();
      },
      disconnect: () => socketRef.current?.disconnect()
    }),
    [state]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
