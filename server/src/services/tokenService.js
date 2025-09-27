const jwt = require('jsonwebtoken');
const env = require('../config/env');
const RefreshToken = require('../models/RefreshToken');
const AppError = require('../utils/AppError');
const ms = require('ms');

const REFRESH_TTL_MS = ms(env.jwt.refreshTtl || '7d');

/**
 * Issues JWT access & refresh tokens for a user.
 */
const generateAccessToken = (user) => {
  const payload = {
    userId: user.id || user.userId,
    role: user.role,
  };

  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessTtl,
  });
};

const generateAuthTokens = async (user, ipAddress = null) => {
  const accessToken = generateAccessToken(user);

  const refreshTokenValue = RefreshToken.generateToken();
  const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);

  const refreshTokenDoc = await RefreshToken.create({
    user: user.id,
    token: refreshTokenValue,
    expiresAt,
    createdByIp: ipAddress,
  });

  return {
    accessToken,
    refreshToken: refreshTokenDoc.token,
  };
};

const verifyAccessToken = (token) => jwt.verify(token, env.jwt.accessSecret);

const verifyRefreshToken = async (token) => {
  const refreshToken = await RefreshToken.findOne({ token }).populate('user');
  if (!refreshToken || !refreshToken.isActive()) {
    throw new AppError('Invalid or expired refresh token', 401);
  }
  return refreshToken;
};

const rotateRefreshToken = async (refreshToken, ipAddress = null) => {
  refreshToken.revokedAt = new Date();
  refreshToken.revokedByIp = ipAddress;
  const newTokenValue = RefreshToken.generateToken();
  refreshToken.replacedByToken = newTokenValue;
  await refreshToken.save();

  const newToken = await RefreshToken.create({
    user: refreshToken.user,
    token: newTokenValue,
  expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    createdByIp: ipAddress,
  });

  return newToken;
};

const revokeRefreshTokensForUser = async (userId) => {
  await RefreshToken.updateMany(
    { user: userId, revokedAt: { $exists: false } },
    { revokedAt: new Date() }
  );
};

module.exports = {
  generateAuthTokens,
  generateAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
  rotateRefreshToken,
  revokeRefreshTokensForUser,
};
