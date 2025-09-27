const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const leanVirtuals = require('mongoose-lean-virtuals');

// Define Event Schema
const eventSchema = new mongoose.Schema({
    // Basic event information
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Event description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    shortDescription: {
        type: String,
        maxlength: [200, 'Short description cannot exceed 200 characters']
    },
    
    // Event scheduling
    date: {
        type: Date,
        required: [true, 'Event date is required'],
        validate: {
            validator: function(value) {
                return value > new Date();
            },
            message: 'Event date must be in the future'
        }
    },
    startTime: {
        type: String,
        required: [true, 'Start time is required'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)']
    },
    endTime: {
        type: String,
        required: [true, 'End time is required'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)']
    },
    duration: {
        type: Number,  // Duration in minutes
        default: 120
    },
    
    // Event location
    location: {
        address: {
            type: String,
            required: [true, 'Event address is required']
        },
        venue: {
            type: String,
            required: [true, 'Venue name is required']
        },
        coordinates: {
            lat: {
                type: Number,
                required: [true, 'Latitude is required'],
                min: [-90, 'Latitude must be between -90 and 90'],
                max: [90, 'Latitude must be between -90 and 90']
            },
            lng: {
                type: Number,
                required: [true, 'Longitude is required'],
                min: [-180, 'Longitude must be between -180 and 180'],
                max: [180, 'Longitude must be between -180 and 180']
            }
        },
        city: String,
        country: String
    },
    
    // Event organizer
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Event organizer is required']
    },
    
    // Event capacity and registration
    maxCapacity: {
        type: Number,
        min: [1, 'Event must have at least 1 capacity'],
        default: 100
    },
    registrationDeadline: {
        type: Date,
        validate: {
            validator: function(value) {
                return !value || value < this.date;
            },
            message: 'Registration deadline must be before event date'
        }
    },
    registrationFee: {
        type: Number,
        min: [0, 'Registration fee cannot be negative'],
        default: 0
    },
    
    // Attendee management
    attendees: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        registeredAt: {
            type: Date,
            default: Date.now
        },
        attended: {
            type: Boolean,
            default: false
        },
        attendedAt: {
            type: Date,
            default: null
        },
        checkInLocation: {
            lat: Number,
            lng: Number,
            accuracy: Number  // GPS accuracy in meters
        },
        certificateIssued: {
            type: Boolean,
            default: false
        },
        certificateHash: String,
        notes: String
    }],
    
    // Event categorization
    category: {
        type: String,
        enum: ['technology', 'business', 'education', 'healthcare', 'sports', 'arts', 'networking', 'workshop', 'conference', 'seminar', 'other'],
        default: 'other'
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    
    // Event rewards and gamification
    credits: {
        type: Number,
        min: [1, 'Event must award at least 1 credit'],
        default: 1
    },
    certificateTemplate: {
        type: String,
        default: 'default'
    },

    calendarSync: {
        synced: {
            type: Boolean,
            default: false
        },
        googleEventId: String,
        syncedAt: Date
    },

    integrationLinks: {
        linkedinShareUrl: String,
        website: String,
        registrationLink: String
    },
    
    // Event settings
    isPublic: {
        type: Boolean,
        default: true
    },
    requiresApproval: {
        type: Boolean,
        default: false
    },
    allowWaitlist: {
        type: Boolean,
        default: false
    },
    
    // GPS attendance settings
    attendanceRadius: {
        type: Number,  // Radius in meters
        min: [10, 'Attendance radius must be at least 10 meters'],
        max: [1000, 'Attendance radius cannot exceed 1000 meters'],
        default: 100
    },
    strictAttendance: {
        type: Boolean,
        default: true
    },
    
    // Event status
    status: {
        type: String,
        enum: ['draft', 'published', 'cancelled', 'completed', 'ongoing'],
        default: 'draft'
    },
    
    // Event media
    images: [{
        url: String,
        caption: String,
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],

    mediaAssets: [{
        filename: String,
        url: String,
        type: {
            type: String,
            enum: ['banner', 'brochure', 'other'],
            default: 'other'
        }
    }],
    
    // Analytics
    analytics: {
        views: {
            type: Number,
            default: 0
        },
        registrations: {
            type: Number,
            default: 0
        },
        attendanceRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        rating: {
            average: {
                type: Number,
                default: 0,
                min: 0,
                max: 5
            },
            count: {
                type: Number,
                default: 0
            }
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
eventSchema.index({ 'location.coordinates': '2dsphere' });  // Geospatial index
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ organizer: 1, status: 1 });
eventSchema.index({ category: 1, isPublic: 1 });
eventSchema.index({ tags: 1 });
eventSchema.index({ 'analytics.rating.average': -1 });
eventSchema.plugin(aggregatePaginate);
eventSchema.plugin(leanVirtuals);

// Virtual for attendee count
eventSchema.virtual('attendeeCount').get(function() {
    return this.attendees.length;
});

// Virtual for available spots
eventSchema.virtual('availableSpots').get(function() {
    return this.maxCapacity - this.attendees.length;
});

// Virtual for actual attendee count (who actually attended)
eventSchema.virtual('actualAttendeeCount').get(function() {
    return this.attendees.filter(attendee => attendee.attended).length;
});

// Virtual for registration status
eventSchema.virtual('registrationStatus').get(function() {
    const now = new Date();
    if (this.registrationDeadline && now > this.registrationDeadline) {
        return 'closed';
    }
    if (this.attendees.length >= this.maxCapacity) {
        return 'full';
    }
    return 'open';
});

// Pre-save middleware to update analytics
eventSchema.pre('save', function(next) {
    // Update registration count
    this.analytics.registrations = this.attendees.length;
    
    // Calculate attendance rate
    const totalAttended = this.attendees.filter(a => a.attended).length;
    if (this.attendees.length > 0) {
        this.analytics.attendanceRate = Math.round((totalAttended / this.attendees.length) * 100);
    }
    
    next();
});

// Instance method to check if user is registered
eventSchema.methods.isUserRegistered = function(userId) {
    return this.attendees.some(attendee => 
        attendee.user.toString() === userId.toString()
    );
};

// Instance method to get attendee info
eventSchema.methods.getAttendeeInfo = function(userId) {
    return this.attendees.find(attendee => 
        attendee.user.toString() === userId.toString()
    );
};

// Instance method to calculate distance from point
eventSchema.methods.calculateDistance = function(lat, lng) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = this.location.coordinates.lat * Math.PI/180;
    const φ2 = lat * Math.PI/180;
    const Δφ = (lat - this.location.coordinates.lat) * Math.PI/180;
    const Δλ = (lng - this.location.coordinates.lng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
};

// Static method to find nearby events
eventSchema.statics.findNearby = function(lat, lng, maxDistance = 10000) {
    return this.find({
        'location.coordinates': {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [lng, lat]
                },
                $maxDistance: maxDistance
            }
        },
        status: 'published',
        date: { $gte: new Date() }
    });
};

// Static method to find events by organizer
eventSchema.statics.findByOrganizer = function(organizerId) {
    return this.find({ organizer: organizerId })
               .sort({ date: -1 })
               .populate('organizer', 'name email avatar');
};

module.exports = mongoose.model('Event', eventSchema);
