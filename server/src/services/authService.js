const AppError = require('../utils/AppError');
const User = require('../models/User');
const tokenService = require('./tokenService');
const emailService = require('./emailService');
const Notification = require('../models/Notification');
const logger = require('../config/logger');
const { NOTIFICATION_TYPES, SOCKET_ROOMS } = require('../utils/constants');

const buildPublicUser = (user) => {
  const userObj = user.toObject({ virtuals: true });
  delete userObj.password;
  delete userObj.security;
  delete userObj.integrations;
  delete userObj.__v;
  return userObj;
};

const registerUser = async (payload, ipAddress, io) => {
  const existing = await User.findOne({ email: payload.email.toLowerCase() });
  if (existing) {
    throw new AppError('Email already registered', 400);
  }

  const user = await User.create({
    name: payload.name,
    email: payload.email.toLowerCase(),
    password: payload.password,
    role: payload.role || 'attendee',
    bio: payload.bio,
    location: payload.location,
  });

  const tokens = await tokenService.generateAuthTokens(user, ipAddress);

  await emailService.sendWelcomeEmail(user);

  // Notify followers if organizer
  if (user.role === 'organizer' && io) {
    const notification = await Notification.create({
      user: user._id,
      type: NOTIFICATION_TYPES.EVENT_UPDATE,
      title: 'Organizer profile ready',
      message: 'Start creating events and engaging with your attendees.',
      data: {},
    });
    io.to(SOCKET_ROOMS.user(user._id)).emit('notification:new', notification);
  }

  return { user: buildPublicUser(user), tokens };
};

const loginUser = async (email, password, ipAddress) => {
  // Basic input validation
  const normalizedEmail = (email || '').toString().trim().toLowerCase();
  const providedPassword = password || '';

  if (!normalizedEmail || !providedPassword) {
    logger.debug('Auth login attempt with missing fields', { ipAddress, email: normalizedEmail ? '<redacted>' : null });
    throw new AppError('Email and password are required', 400);
  }

  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    logger.debug('Invalid login - user not found', { email: normalizedEmail, ipAddress });
    // generic message to avoid user enumeration
    throw new AppError('Invalid credentials', 401);
  }

  const isMatch = await user.matchPassword(providedPassword);
  if (!isMatch) {
    logger.debug('Invalid login - wrong password', { userId: user._id, email: normalizedEmail, ipAddress });
    throw new AppError('Invalid credentials', 401);
  }

  const tokens = await tokenService.generateAuthTokens(user, ipAddress);

  user.lastLogin = new Date();
  user.security.lastLoginIp = ipAddress;
  await user.save();

  return { user: buildPublicUser(user), tokens };
};

const refreshTokens = async (refreshTokenValue, ipAddress) => {
  const existingToken = await tokenService.verifyRefreshToken(refreshTokenValue);
  const rotatedToken = await tokenService.rotateRefreshToken(existingToken, ipAddress);

  const accessToken = tokenService.generateAccessToken(existingToken.user);

  return {
    accessToken,
    refreshToken: rotatedToken.token,
  };
};

module.exports = {
  buildPublicUser,
  registerUser,
  loginUser,
  refreshTokens,
};
