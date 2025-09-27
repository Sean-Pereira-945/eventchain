const asyncHandler = require('../utils/asyncHandler');
const respond = require('../utils/respond');
const AppError = require('../utils/AppError');
const User = require('../models/User');

/**
 * GET /api/users/profile/:id
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -security -resetPasswordToken -resetPasswordExpires')
    .populate('certificates.eventId', 'title date location');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return respond(res, 200, {
    data: {
      user,
      stats: user.getStats(),
    },
  });
});

/**
 * POST /api/users/follow/:id
 */
const toggleFollow = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id.toString()) {
    throw new AppError('You cannot follow yourself', 400);
  }

  const [currentUser, targetUser] = await Promise.all([
    User.findById(req.user.id),
    User.findById(req.params.id),
  ]);

  if (!targetUser) {
    throw new AppError('User not found', 404);
  }

  const followingIndex = currentUser.following.findIndex((f) => f.user.equals(targetUser.id));

  if (followingIndex > -1) {
    currentUser.following.splice(followingIndex, 1);
    targetUser.followers = targetUser.followers.filter((f) => !f.user.equals(currentUser.id));
    await Promise.all([currentUser.save(), targetUser.save()]);
    return respond(res, 200, { message: 'Unfollowed user', data: { isFollowing: false } });
  }

  currentUser.following.push({ user: targetUser.id });
  targetUser.followers.push({ user: currentUser.id });
  await Promise.all([currentUser.save(), targetUser.save()]);

  return respond(res, 200, { message: 'User followed', data: { isFollowing: true } });
});

/**
 * GET /api/users/organizers
 */
const listOrganizers = asyncHandler(async (req, res) => {
  const organizers = await User.findByRole('organizer')
    .select('name avatar bio location eventsOrganized followers')
    .lean();

  return respond(res, 200, { data: organizers });
});

module.exports = {
  getProfile,
  toggleFollow,
  listOrganizers,
};
