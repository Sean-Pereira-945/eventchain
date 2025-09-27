const Joi = require('joi');

// Shared schema fragments
const locationSchema = Joi.object({
  address: Joi.string().trim().min(3).max(255).required(),
  venue: Joi.string().trim().min(2).max(100).required(),
  coordinates: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
  }).required(),
  city: Joi.string().trim().max(100).allow('', null),
  country: Joi.string().trim().max(100).allow('', null),
});

const paginationQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().trim().optional(),
});

const authValidators = {
  register: Joi.object({
    name: Joi.string().trim().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(128).required(),
    role: Joi.string().valid('organizer', 'attendee').default('attendee'),
    bio: Joi.string().max(500).allow('', null),
    location: Joi.object({
      city: Joi.string().trim().max(100).allow('', null),
      country: Joi.string().trim().max(100).allow('', null),
    }).optional(),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
  refresh: Joi.object({
    refreshToken: Joi.string().required(),
  }),
  updateProfile: Joi.object({
    name: Joi.string().trim().min(2).max(50),
    bio: Joi.string().max(500).allow('', null),
    avatar: Joi.string().uri().allow('', null),
    location: Joi.object({
      city: Joi.string().trim().max(100).allow('', null),
      country: Joi.string().trim().max(100).allow('', null),
    }),
    social: Joi.object({
      linkedin: Joi.string().uri().allow('', null),
      twitter: Joi.string().uri().allow('', null),
      website: Joi.string().uri().allow('', null),
    }),
    preferences: Joi.object().unknown(true),
  }),
};

const eventValidators = {
  create: Joi.object({
    title: Joi.string().trim().min(5).max(100).required(),
    description: Joi.string().trim().min(20).max(4000).required(),
    shortDescription: Joi.string().trim().max(240).allow('', null),
    date: Joi.date().iso().required(),
    startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    location: locationSchema.required(),
    maxCapacity: Joi.number().integer().min(1).max(5000).default(100),
    registrationDeadline: Joi.date().iso().greater('now').allow(null),
    registrationFee: Joi.number().min(0).default(0),
    category: Joi.string().trim().max(100).allow('', null),
    tags: Joi.array().items(Joi.string().trim().max(50)).default([]),
    credits: Joi.number().integer().min(1).max(50).default(1),
    attendanceRadius: Joi.number().integer().min(10).max(1000).default(100),
    isPublic: Joi.boolean().default(true),
    requiresApproval: Joi.boolean().default(false),
    allowWaitlist: Joi.boolean().default(false),
    images: Joi.array()
      .items(
        Joi.object({
          url: Joi.string().uri().required(),
          caption: Joi.string().trim().max(120).allow('', null),
          isPrimary: Joi.boolean().default(false),
        })
      )
      .default([]),
  }),
  update: Joi.object({
    title: Joi.string().trim().min(5).max(100),
    description: Joi.string().trim().min(20).max(4000),
    shortDescription: Joi.string().trim().max(240).allow('', null),
    date: Joi.date().iso(),
    startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    location: locationSchema,
    maxCapacity: Joi.number().integer().min(1).max(5000),
    registrationDeadline: Joi.date().iso().allow(null),
    registrationFee: Joi.number().min(0),
    category: Joi.string().trim().max(100).allow('', null),
    tags: Joi.array().items(Joi.string().trim().max(50)),
    credits: Joi.number().integer().min(1).max(50),
    attendanceRadius: Joi.number().integer().min(10).max(1000),
    isPublic: Joi.boolean(),
    requiresApproval: Joi.boolean(),
    allowWaitlist: Joi.boolean(),
    images: Joi.array().items(
      Joi.object({
        url: Joi.string().uri().required(),
        caption: Joi.string().trim().max(120).allow('', null),
        isPrimary: Joi.boolean().default(false),
      })
    ),
    status: Joi.string().valid('draft', 'published', 'cancelled', 'completed', 'ongoing'),
  }),
};

const attendanceValidators = {
  checkIn: Joi.object({
    lat: Joi.number().required(),
    lng: Joi.number().required(),
    accuracy: Joi.number().min(0).max(1000).optional(),
  }),
};

const certificateValidators = {
  issue: Joi.object({
    eventId: Joi.string().hex().length(24).required(),
    attendeeId: Joi.string().hex().length(24).required(),
  }),
  verify: Joi.object({
    hash: Joi.string().hex().length(64).required(),
  }),
};

module.exports = {
  authValidators,
  eventValidators,
  attendanceValidators,
  certificateValidators,
  paginationQuery,
};
