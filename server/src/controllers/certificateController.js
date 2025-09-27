const asyncHandler = require('../utils/asyncHandler');
const respond = require('../utils/respond');
const AppError = require('../utils/AppError');
const Event = require('../models/Event');
const User = require('../models/User');
const Certificate = require('../models/Certificate');
const emailService = require('../services/emailService');
const blockchainService = require('../services/blockchainService');
const { createNotification } = require('../services/notificationService');
const { NOTIFICATION_TYPES } = require('../utils/constants');

/**
 * POST /api/certificates/issue
 */
const issueCertificate = (io) =>
  asyncHandler(async (req, res) => {
    const { eventId, attendeeId } = req.body;
    const event = await Event.findById(eventId);

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    if (!event.organizer.equals(req.user.id) && req.user.role !== 'admin') {
      throw new AppError('Only organizers can issue certificates', 403);
    }

    const attendee = event.attendees.find((a) => a.user.equals(attendeeId));
    if (!attendee || !attendee.attended) {
      throw new AppError('Attendee has not completed attendance', 400);
    }

    if (attendee.certificateIssued) {
      throw new AppError('Certificate already issued', 400);
    }

    const user = await User.findById(attendeeId);

    const block = await blockchainService.issueCertificateBlock({
      eventId: event.id,
      attendeeId,
      organizerId: req.user.id,
      metadata: {
        eventTitle: event.title,
        attendeeName: user.name,
        credits: event.credits,
        attendedAt: attendee.attendedAt,
      },
    });

    const certificate = await Certificate.create({
      event: event.id,
      attendee: attendeeId,
      organizer: req.user.id,
      blockHash: block.hash,
      blockchainIndex: block.index,
      merkleRoot: block.merkleRoot,
      proof: block.proof || [],
      credits: event.credits,
      metadata: {
        location: event.location.address,
        attendedAt: attendee.attendedAt,
        signature: block.signature,
      },
    });

    attendee.certificateIssued = true;
    attendee.certificateHash = block.hash;
    await event.save();

    user.certificates.push({
      eventId: event.id,
      certificateHash: block.hash,
      credits: event.credits,
      issuedAt: new Date(),
    });
    user.totalCredits += event.credits;
    await user.save();

    await emailService.sendCertificateIssuedEmail(user, event, block.hash);
    await createNotification(attendeeId, {
      type: NOTIFICATION_TYPES.CERTIFICATE_ISSUED,
      title: `Certificate ready for ${event.title}`,
      message: 'Share it with your network and showcase your achievement. ✅',
      data: { certificateHash: block.hash, eventId: event.id },
    }, io);

    return respond(res, 201, {
      message: 'Certificate issued',
      data: certificate,
    });
  });

/**
 * GET /api/certificates/my
 */
const myCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find({ attendee: req.user.id })
    .populate('event', 'title date location credits')
    .lean();

  return respond(res, 200, {
    data: certificates,
  });
});

/**
 * GET /api/certificates/verify/:hash
 */
const verifyCertificate = asyncHandler(async (req, res) => {
  const { hash } = req.params;
  const certificate = await Certificate.findOne({ blockHash: hash })
    .populate('event', 'title date location organizer')
    .populate('attendee', 'name');

  if (!certificate) {
    throw new AppError('Certificate not found', 404);
  }

  const blockchainVerification = await blockchainService.verifyCertificateHash(hash);

  return respond(res, 200, {
    data: {
      certificate,
      blockchainVerification,
    },
  });
});

/**
 * GET /api/certificates/blockchain
 */
const getBlockchain = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const data = await blockchainService.getBlockchainState(Number(limit));
  return respond(res, 200, { data });
});

module.exports = {
  issueCertificate,
  myCertificates,
  verifyCertificate,
  getBlockchain,
};
