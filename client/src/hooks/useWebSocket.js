import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

const useWebSocket = (event, handler, deps = []) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || !event) return;
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, event, ...deps]);
};

export default useWebSocket;
