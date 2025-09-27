module.exports = {
  USER_ROLES: ['organizer', 'attendee', 'admin'],
  EVENT_STATUSES: ['draft', 'published', 'cancelled', 'completed', 'ongoing'],
  NOTIFICATION_TYPES: {
    EVENT_UPDATE: 'EVENT_UPDATE',
    NEW_FOLLOWER: 'NEW_FOLLOWER',
    CERTIFICATE_ISSUED: 'CERTIFICATE_ISSUED',
    ATTENDANCE_CONFIRMED: 'ATTENDANCE_CONFIRMED',
  },
  SOCKET_ROOMS: {
    user: (userId) => `user:${userId}`,
  },
};
