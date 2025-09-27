const Notification = require('../models/Notification');
const { SOCKET_ROOMS } = require('../utils/constants');

const createNotification = async (userId, payload, io = null) => {
  const notification = await Notification.create({
    user: userId,
    ...payload,
  });

  if (io) {
    io.to(SOCKET_ROOMS.user(userId)).emit('notification:new', notification);
  }

  return notification;
};

const markNotificationsRead = async (userId, notificationIds = []) => {
  const query = { user: userId };
  if (notificationIds.length) {
    query._id = { $in: notificationIds };
  }

  return Notification.updateMany(query, { readAt: new Date() });
};

module.exports = {
  createNotification,
  markNotificationsRead,
};
