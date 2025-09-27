const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const uniqueValidator = require('mongoose-unique-validator');
const leanVirtuals = require('mongoose-lean-virtuals');

// Define User Schema
const userSchema = new mongoose.Schema({
    // Basic user information
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false  // Don't include password in queries by default
    },
    
    // User role and permissions
    role: {
        type: String,
        enum: ['organizer', 'attendee', 'admin'],
        default: 'attendee'
    },
    
    // Profile information
    avatar: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    location: {
        city: String,
        country: String
    },
    
    // Social connections
    following: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        followedAt: {
            type: Date,
            default: Date.now
        }
    }],
    followers: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        followedAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    social: {
        linkedin: { type: String, trim: true },
        twitter: { type: String, trim: true },
        website: { type: String, trim: true }
    },

    integrations: {
        googleCalendar: {
            refreshToken: String,
            syncedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
            lastSyncedAt: Date
        },
        linkedin: {
            accessToken: String,
            expiresAt: Date
        }
    },

    preferences: {
        language: {
            type: String,
            default: 'en'
        },
        theme: {
            type: String,
            enum: ['light', 'dark', 'system'],
            default: 'light'
        },
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            push: {
                type: Boolean,
                default: true
            },
            eventReminders: {
                type: Boolean,
                default: true
            },
            newFollowers: {
                type: Boolean,
                default: true
            }
        }
    },

    // Event statistics
    eventsOrganized: {
        type: Number,
        default: 0
    },
    eventsAttended: {
        type: Number,
        default: 0
    },
    totalCredits: {
        type: Number,
        default: 0
    },
    
    // Certificate collection
    certificates: [{
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event'
        },
        certificateHash: {
            type: String,
            required: true
        },
        credits: {
            type: Number,
            default: 1
        },
        issuedAt: {
            type: Date,
            default: Date.now
        },
        verified: {
            type: Boolean,
            default: true
        }
    }],
    
    // Account status
    isActive: {
        type: Boolean,
        default: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    
    security: {
        lastPasswordChange: {
            type: Date,
            default: Date.now
        },
        lastLoginIp: String,
        devices: [{
            ip: String,
            userAgent: String,
            lastUsedAt: Date
        }]
    }
}, {
    timestamps: true,  // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'following.user': 1 });
userSchema.index({ totalCredits: -1 });
userSchema.plugin(uniqueValidator, { message: '{PATH} must be unique.' });
userSchema.plugin(leanVirtuals);

// Virtual for follower count
userSchema.virtual('followerCount').get(function() {
    return this.followers.length;
});

// Virtual for following count
userSchema.virtual('followingCount').get(function() {
    return this.following.length;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
    // Only hash password if it has been modified
    if (!this.isModified('password')) return next();
    
    try {
        // Hash password with cost of 12
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        this.security.lastPasswordChange = new Date();
        next();
    } catch (error) {
        next(error);
    }
});

// Instance method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method to generate user stats
userSchema.methods.getStats = function() {
    return {
        eventsOrganized: this.eventsOrganized,
        eventsAttended: this.eventsAttended,
        totalCredits: this.totalCredits,
        certificatesEarned: this.certificates.length,
        followersCount: this.followerCount,
        followingCount: this.followingCount
    };
};

// Static method to find users by role
userSchema.statics.findByRole = function(role) {
    return this.find({ role, isActive: true });
};

userSchema.methods.generatePasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    return resetToken;
};

userSchema.methods.generateEmailVerificationToken = function() {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    return verificationToken;
};

// Export User model
module.exports = mongoose.model('User', userSchema);
