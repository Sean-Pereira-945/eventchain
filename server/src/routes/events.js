const express = require('express');
const Event = require('../models/Event');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/events
// @desc    Get all events
// @access  Public
router.get('/', async (req, res) => {
    try {
        const events = await Event.find({ status: 'published' })
            .populate('organizer', 'name email avatar')
            .sort({ date: 1 });
        
        res.json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching events'
        });
    }
});

// @route   POST /api/events
// @desc    Create new event
// @access  Private (Organizers only)
router.post('/', auth, authorize('organizer', 'admin'), async (req, res) => {
    try {
        const eventData = {
            ...req.body,
            organizer: req.userId
        };
        
        const event = new Event(eventData);
        await event.save();
        
        // Populate organizer details
        await event.populate('organizer', 'name email avatar');
        
        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: event
        });
    } catch (error) {
        console.error('Create event error:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error creating event'
        });
    }
});

// @route   GET /api/events/:id
// @desc    Get single event
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'name email avatar bio')
            .populate('attendees.user', 'name email avatar');
        
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        
        // Increment view count
        event.analytics.views += 1;
        await event.save();
        
        res.json({
            success: true,
            data: event
        });
    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching event'
        });
    }
});

// @route   POST /api/events/:id/register
// @desc    Register for event
// @access  Private
router.post('/:id/register', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        
        // Check if already registered
        if (event.isUserRegistered(req.userId)) {
            return res.status(400).json({
                success: false,
                message: 'Already registered for this event'
            });
        }
        
        // Check capacity
        if (event.attendees.length >= event.maxCapacity) {
            return res.status(400).json({
                success: false,
                message: 'Event is at full capacity'
            });
        }
        
        // Check registration deadline
        if (event.registrationDeadline && new Date() > event.registrationDeadline) {
            return res.status(400).json({
                success: false,
                message: 'Registration deadline has passed'
            });
        }
        
        // Add attendee
        event.attendees.push({
            user: req.userId,
            registeredAt: new Date()
        });
        
        await event.save();
        
        res.json({
            success: true,
            message: 'Successfully registered for event'
        });
    } catch (error) {
        console.error('Register for event error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error registering for event'
        });
    }
});

// @route   POST /api/events/:id/attend
// @desc    Mark attendance with GPS verification
// @access  Private
router.post('/:id/attend', auth, async (req, res) => {
    try {
        const { lat, lng, accuracy } = req.body;
        
        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'GPS coordinates are required'
            });
        }
        
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        
        // Check if user is registered
        const attendeeIndex = event.attendees.findIndex(
            attendee => attendee.user.toString() === req.userId.toString()
        );
        
        if (attendeeIndex === -1) {
            return res.status(400).json({
                success: false,
                message: 'You must register for this event first'
            });
        }
        
        // Check if already attended
        if (event.attendees[attendeeIndex].attended) {
            return res.status(400).json({
                success: false,
                message: 'Attendance already marked'
            });
        }
        
        // Calculate distance from event location
        const distance = event.calculateDistance(lat, lng);
        
        if (distance > event.attendanceRadius) {
            return res.status(400).json({
                success: false,
                message: `You must be within ${event.attendanceRadius}m of the event location. Current distance: ${Math.round(distance)}m`
            });
        }
        
        // Mark attendance
        event.attendees[attendeeIndex].attended = true;
        event.attendees[attendeeIndex].attendedAt = new Date();
        event.attendees[attendeeIndex].checkInLocation = {
            lat,
            lng,
            accuracy: accuracy || null
        };
        
        await event.save();
        
        // Generate QR code data for certificate
        const qrData = {
            eventId: event._id,
            userId: req.userId,
            attendedAt: new Date(),
            credits: event.credits,
            signature: `${event._id}_${req.userId}_${Date.now()}`
        };
        
        res.json({
            success: true,
            message: 'Attendance marked successfully',
            data: {
                qrCode: Buffer.from(JSON.stringify(qrData)).toString('base64'),
                credits: event.credits,
                distance: Math.round(distance)
            }
        });
    } catch (error) {
        console.error('Mark attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error marking attendance'
        });
    }
});

module.exports = router;
