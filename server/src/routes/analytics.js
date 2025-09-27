const express = require('express');
const Event = require('../models/Event');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics for organizer
// @access  Private (Organizers only)
router.get('/dashboard', auth, authorize('organizer', 'admin'), async (req, res) => {
    try {
        const organizerId = req.userId;
        
        // Get organizer's events
        const events = await Event.find({ organizer: organizerId });
        
        // Calculate analytics
        const totalEvents = events.length;
        const upcomingEvents = events.filter(event => event.date > new Date()).length;
        const completedEvents = events.filter(event => event.status === 'completed').length;
        
        const totalRegistrations = events.reduce((sum, event) => sum + event.attendees.length, 0);
        const totalAttended = events.reduce((sum, event) => 
            sum + event.attendees.filter(attendee => attendee.attended).length, 0
        );
        
        const avgAttendanceRate = totalRegistrations > 0 ? 
            Math.round((totalAttended / totalRegistrations) * 100) : 0;
        
        // Monthly event data for charts
        const monthlyData = {};
        events.forEach(event => {
            const monthKey = event.date.toISOString().slice(0, 7); // YYYY-MM
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    events: 0,
                    registrations: 0,
                    attended: 0
                };
            }
            monthlyData[monthKey].events += 1;
            monthlyData[monthKey].registrations += event.attendees.length;
            monthlyData[monthKey].attended += event.attendees.filter(a => a.attended).length;
        });
        
        res.json({
            success: true,
            data: {
                overview: {
                    totalEvents,
                    upcomingEvents,
                    completedEvents,
                    totalRegistrations,
                    totalAttended,
                    avgAttendanceRate
                },
                monthlyData,
                recentEvents: events
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5)
                    .map(event => ({
                        id: event._id,
                        title: event.title,
                        date: event.date,
                        attendees: event.attendees.length,
                        attended: event.attendees.filter(a => a.attended).length
                    }))
            }
        });
        
    } catch (error) {
        console.error('Get dashboard analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching analytics'
        });
    }
});

// @route   GET /api/analytics/event/:id
// @desc    Get detailed analytics for specific event
// @access  Private (Event organizer only)
router.get('/event/:id', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('attendees.user', 'name email avatar')
            .populate('organizer', 'name email');
        
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        
        // Check if user is organizer or admin
        if (event.organizer._id.toString() !== req.userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        
        // Calculate detailed analytics
        const totalRegistered = event.attendees.length;
        const totalAttended = event.attendees.filter(a => a.attended).length;
        const attendanceRate = totalRegistered > 0 ? 
            Math.round((totalAttended / totalRegistered) * 100) : 0;
        const certificatesIssued = event.attendees.filter(a => a.certificateIssued).length;
        
        // Registration timeline (group by date)
        const registrationTimeline = {};
        event.attendees.forEach(attendee => {
            const dateKey = attendee.registeredAt.toISOString().slice(0, 10); // YYYY-MM-DD
            registrationTimeline[dateKey] = (registrationTimeline[dateKey] || 0) + 1;
        });
        
        res.json({
            success: true,
            data: {
                eventInfo: {
                    id: event._id,
                    title: event.title,
                    date: event.date,
                    location: event.location,
                    status: event.status
                },
                analytics: {
                    totalRegistered,
                    totalAttended,
                    attendanceRate,
                    certificatesIssued,
                    views: event.analytics.views,
                    rating: event.analytics.rating
                },
                registrationTimeline,
                attendees: event.attendees.map(attendee => ({
                    id: attendee.user._id,
                    name: attendee.user.name,
                    email: attendee.user.email,
                    avatar: attendee.user.avatar,
                    registeredAt: attendee.registeredAt,
                    attended: attendee.attended,
                    attendedAt: attendee.attendedAt,
                    certificateIssued: attendee.certificateIssued
                }))
            }
        });
        
    } catch (error) {
        console.error('Get event analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching event analytics'
        });
    }
});

module.exports = router;
