const crypto = require('crypto');
const asyncHandler = require('../utils/asyncHandler');
const respond = require('../utils/respond');
const AppError = require('../utils/AppError');
const User = require('../models/User');
const authService = require('../services/authService');
const tokenService = require('../services/tokenService');
const emailService = require('../services/emailService');
const env = require('../config/env');

/**
 * POST /api/auth/register
 */
const register = (io) =>
  asyncHandler(async (req, res) => {
    const result = await authService.registerUser(req.body, req.ip, io);
    return respond(res, 201, {
      message: 'Registration successful',
      data: result,
    });
  });

/**
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password, req.ip);
  return respond(res, 200, {
    message: 'Login successful',
    data: result,
  });
});

/**
 * POST /api/auth/refresh
 */
const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshTokens(refreshToken, req.ip);
  return respond(res, 200, {
    message: 'Tokens refreshed',
    data: tokens,
  });
});

/**
 * GET /api/auth/profile
 */
const getProfile = asyncHandler(async (req, res) => {
  return respond(res, 200, {
    data: { user: authService.buildPublicUser(req.user) },
  });
});

/**
 * PUT /api/auth/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  Object.assign(req.user, req.body);
  await req.user.save();
  return respond(res, 200, {
    message: 'Profile updated',
    data: { user: authService.buildPublicUser(req.user) },
  });
});

/**
 * POST /api/auth/change-password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const isMatch = await req.user.matchPassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 400);
  }

  req.user.password = newPassword;
  await req.user.save();

  return respond(res, 200, { message: 'Password updated successfully' });
});

/**
 * POST /api/auth/forgot-password
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    // respond with generic message to prevent user enumeration
    return respond(res, 200, {
      message: 'If that account exists we sent instructions to the registered email.',
    });
  }

  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });
  await emailService.sendPasswordResetEmail(user, resetToken);

  return respond(res, 200, {
    message: 'Password reset instructions sent if the email exists.',
  });
});

/**
 * POST /api/auth/reset-password
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const hashed = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('Reset token is invalid or has expired', 400);
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return respond(res, 200, { message: 'Password reset successful' });
});

/**
 * POST /api/auth/verify-email
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const hashed = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashed,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('Verification token invalid or expired', 400);
  }

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return respond(res, 200, { message: 'Email verified successfully' });
});

/**
 * POST /api/auth/resend-verification
 */
const resendVerification = asyncHandler(async (req, res) => {
  if (req.user.emailVerified) {
    return respond(res, 200, { message: 'Email already verified' });
  }

  const token = req.user.generateEmailVerificationToken();
  await req.user.save({ validateBeforeSave: false });
  await emailService.sendWelcomeEmail(req.user); // reuse welcome email as verification prompt

  return respond(res, 200, {
    message: 'Verification email sent',
    data: { token },
  });
});

/**
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  await tokenService.revokeRefreshTokensForUser(req.user.id);
  return respond(res, 200, { message: 'Logged out successfully' });
});

module.exports = {
  register,
  login,
  refresh,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  logout,
};
