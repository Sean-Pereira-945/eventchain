const asyncHandler = require('../utils/asyncHandler');
const respond = require('../utils/respond');
const AppError = require('../utils/AppError');
const Event = require('../models/Event');
const analyticsService = require('../services/analyticsService');

/**
 * GET /api/analytics/dashboard
 */
const organizerDashboard = asyncHandler(async (req, res) => {
  const metrics = await analyticsService.buildDashboardMetrics(req.user.id);
  return respond(res, 200, { data: metrics });
});

/**
 * GET /api/analytics/event/:id
 */
const eventAnalytics = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('attendees.user', 'name email');

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  if (!event.organizer.equals(req.user.id) && req.user.role !== 'admin') {
    throw new AppError('Forbidden', 403);
  }

  const stats = {
    totalRegistered: event.attendees.length,
    totalAttended: event.attendees.filter((a) => a.attended).length,
    certificatesIssued: event.attendees.filter((a) => a.certificateIssued).length,
    revenue: event.registrationFee * event.attendees.length,
    attendanceRate: event.attendees.length
      ? Math.round((event.attendees.filter((a) => a.attended).length / event.attendees.length) * 100)
      : 0,
    rating: event.analytics.rating,
  };

  const timeline = event.attendees.reduce((acc, attendee) => {
    const dateKey = attendee.registeredAt.toISOString().split('T')[0];
    acc[dateKey] = (acc[dateKey] || 0) + 1;
    return acc;
  }, {});

  return respond(res, 200, {
    data: {
      eventInfo: {
        id: event.id,
        title: event.title,
        date: event.date,
        location: event.location,
      },
      stats,
      timeline,
    },
  });
});

module.exports = {
  organizerDashboard,
  eventAnalytics,
};
