const { Server } = require('socket.io');
const env = require('./env');
const logger = require('./logger');

/**
 * Initializes and configures Socket.io on top of the provided HTTP server.
 * Socket rooms are used to isolate user-specific notifications.
 */
const configureSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.clientUrl,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    logger.debug('🔌 Socket connected', { socketId: socket.id });

    socket.on('join', (userId) => {
      socket.join(`user:${userId}`);
      logger.debug(`👥 User joined notification room`, { userId, room: `user:${userId}` });
    });

    socket.on('leave', (userId) => {
      socket.leave(`user:${userId}`);
      logger.debug(`👋 User left notification room`, { userId });
    });

    socket.on('disconnect', () => {
      logger.debug('⚡ Socket disconnected', { socketId: socket.id });
    });
  });

  return io;
};

module.exports = configureSocket;
