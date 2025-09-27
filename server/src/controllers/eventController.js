const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const respond = require('../utils/respond');
const AppError = require('../utils/AppError');
const Event = require('../models/Event');
const User = require('../models/User');
const Certificate = require('../models/Certificate');
const { haversineDistance } = require('../utils/gps');
const { createNotification } = require('../services/notificationService');
const { NOTIFICATION_TYPES } = require('../utils/constants');
const calendarService = require('../services/calendarService');
const env = require('../config/env');

/**
 * GET /api/events
 */
const listEvents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, category, status, sort = 'date' } = req.query;
  const query = { isPublic: true };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'location.city': { $regex: search, $options: 'i' } },
    ];
  }

  if (category) {
    query.category = category;
  }

  if (status) {
    query.status = status;
  }

  const events = await Event.find(query)
    .populate('organizer', 'name avatar bio')
    .sort({ [sort]: sort.startsWith('-') ? -1 : 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean({ virtuals: true });

  const total = await Event.countDocuments(query);

  return respond(res, 200, {
    data: events,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
    },
  });
});

/**
 * GET /api/events/:id
 */
const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate('organizer', 'name email avatar bio social')
    .populate('attendees.user', 'name email avatar');

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  event.analytics.views += 1;
  await event.save();

  return respond(res, 200, { data: event });
});

/**
 * POST /api/events
 */
const createEvent = (io) =>
  asyncHandler(async (req, res) => {
    const event = await Event.create({
      ...req.body,
      organizer: req.user.id,
      status: req.body.status || 'published',
    });

    await event.populate('organizer', 'name email avatar');

    await calendarService.syncEventToGoogleCalendar(event, req.user);

    await createNotification(req.user.id, {
      type: NOTIFICATION_TYPES.EVENT_UPDATE,
      title: 'Event created',
      message: `${event.title} is now live`,
      data: { eventId: event.id },
    }, io);

    return respond(res, 201, {
      message: 'Event created successfully',
      data: event,
    });
  });

/**
 * PUT /api/events/:id
 */
const updateEvent = (io) =>
  asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    if (!event.organizer.equals(req.user.id) && req.user.role !== 'admin') {
      throw new AppError('Only the organizer can update this event', 403);
    }

    Object.assign(event, req.body);
    await event.save();

    await createNotification(event.organizer, {
      type: NOTIFICATION_TYPES.EVENT_UPDATE,
      title: 'Event updated',
      message: `${event.title} was updated`,
      data: { eventId: event.id },
    }, io);

    return respond(res, 200, {
      message: 'Event updated',
      data: event,
    });
  });

/**
 * DELETE /api/events/:id
 */
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  if (!event.organizer.equals(req.user.id) && req.user.role !== 'admin') {
    throw new AppError('Only the organizer can delete this event', 403);
  }

  await event.remove();

  return respond(res, 200, { message: 'Event removed' });
});

/**
 * POST /api/events/:id/register
 */
const registerForEvent = (io) =>
  asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    const alreadyRegistered = event.isUserRegistered(req.user.id);
    if (alreadyRegistered) {
      throw new AppError('Already registered for this event', 400);
    }

    if (event.attendees.length >= event.maxCapacity) {
      throw new AppError('Event is at capacity', 400);
    }

    event.attendees.push({ user: req.user.id });
    event.analytics.registrations += 1;
    await event.save();

    await createNotification(event.organizer, {
      type: NOTIFICATION_TYPES.EVENT_UPDATE,
      title: 'New registration',
      message: `${req.user.name} registered for ${event.title}`,
      data: { eventId: event.id, attendeeId: req.user.id },
    }, io);

    return respond(res, 200, { message: 'Registration confirmed' });
  });

/**
 * POST /api/events/:id/check-in
 */
const checkIn = (io) =>
  asyncHandler(async (req, res) => {
    const { lat, lng, accuracy } = req.body;
    if (lat == null || lng == null) {
      throw new AppError('Latitude and longitude are required', 400);
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      throw new AppError('Event not found', 404);
    }

    const attendee = event.attendees.find((a) => a.user.equals(req.user.id));
    if (!attendee) {
      throw new AppError('You must register first', 400);
    }

    if (attendee.attended) {
      throw new AppError('Attendance already recorded', 400);
    }

    const distance = haversineDistance(event.location.coordinates, { lat, lng });
    if (distance > event.attendanceRadius) {
      throw new AppError(`You must be within ${event.attendanceRadius} meters (${Math.round(distance)}m away)`, 400);
    }

    attendee.attended = true;
    attendee.attendedAt = new Date();
    attendee.checkInLocation = { lat, lng, accuracy };
    await event.save();

    await createNotification(event.organizer, {
      type: NOTIFICATION_TYPES.ATTENDANCE_CONFIRMED,
      title: 'Attendance confirmed',
      message: `${req.user.name} checked in to ${event.title}`,
      data: { eventId: event.id, attendeeId: req.user.id },
    }, io);

    return respond(res, 200, {
      message: 'Attendance confirmed',
      data: {
        distance: Math.round(distance),
        attendedAt: attendee.attendedAt,
      },
    });
  });

/**
 * POST /api/events/:id/withdraw
 */
const withdrawRegistration = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  event.attendees = event.attendees.filter((a) => !a.user.equals(req.user.id));
  await event.save();

  return respond(res, 200, { message: 'Registration cancelled' });
});

module.exports = {
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  checkIn,
  withdrawRegistration,
};
