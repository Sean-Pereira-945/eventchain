const express = require('express');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/users/profile/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/profile/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password -email')
            .populate('certificates.eventId', 'title date location');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            data: {
                user,
                stats: user.getStats()
            }
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching user profile'
        });
    }
});

// @route   POST /api/users/follow/:id
// @desc    Follow/Unfollow a user
// @access  Private
router.post('/follow/:id', auth, async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.userId;
        
        if (targetUserId === currentUserId.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot follow yourself'
            });
        }
        
        const [currentUser, targetUser] = await Promise.all([
            User.findById(currentUserId),
            User.findById(targetUserId)
        ]);
        
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Check if already following
        const isFollowing = currentUser.following.some(
            follow => follow.user.toString() === targetUserId
        );
        
        if (isFollowing) {
            // Unfollow
            currentUser.following = currentUser.following.filter(
                follow => follow.user.toString() !== targetUserId
            );
            targetUser.followers = targetUser.followers.filter(
                follower => follower.user.toString() !== currentUserId.toString()
            );
            
            await Promise.all([currentUser.save(), targetUser.save()]);
            
            res.json({
                success: true,
                message: 'User unfollowed successfully',
                isFollowing: false
            });
        } else {
            // Follow
            currentUser.following.push({
                user: targetUserId,
                followedAt: new Date()
            });
            targetUser.followers.push({
                user: currentUserId,
                followedAt: new Date()
            });
            
            await Promise.all([currentUser.save(), targetUser.save()]);
            
            res.json({
                success: true,
                message: 'User followed successfully',
                isFollowing: true
            });
        }
    } catch (error) {
        console.error('Follow user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error following user'
        });
    }
});

// @route   GET /api/users/organizers
// @desc    Get all organizers
// @access  Public
router.get('/organizers', async (req, res) => {
    try {
        const organizers = await User.findByRole('organizer')
            .select('name email avatar bio location eventsOrganized')
            .sort({ eventsOrganized: -1 });
        
        res.json({
            success: true,
            count: organizers.length,
            data: organizers
        });
    } catch (error) {
        console.error('Get organizers error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching organizers'
        });
    }
});

module.exports = router;
