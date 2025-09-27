const User = require('../models/User');
const tokenService = require('../services/tokenService');
const AppError = require('../utils/AppError');

// Authentication middleware
const auth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization');

        if (!token) {
            throw new AppError('No token provided, access denied', 401);
        }

        const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;

        const decoded = tokenService.verifyAccessToken(cleanToken);
        
        // Get user from database (excluding password)
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            throw new AppError('Token is valid but user not found', 401);
        }
        
        // Check if user is active
        if (!user.isActive) {
            throw new AppError('User account is deactivated', 401);
        }
        
        // Add user to request object
        req.user = user;
        req.userId = user._id;
        
        next();
    } catch (error) {
        next(error);
    }
};

// Role-based authorization middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        // Check if user is authenticated
        if (!req.user) {
            return next(new AppError('Authentication required', 401));
        }
        
        // Check if user has required role
        if (!roles.includes(req.user.role)) {
            return next(new AppError(`Access denied. Required roles: ${roles.join(', ')}`, 403));
        }
        
        next();
    };
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization');

        if (!token) {
            return next();
        }

        const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
        const decoded = tokenService.verifyAccessToken(cleanToken);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (user && user.isActive) {
            req.user = user;
            req.userId = user._id;
        }
        
        next();
    } catch (error) {
        next();
    }
};

// Middleware to check if user owns resource
const checkOwnership = (Model, resourceIdParam = 'id') => {
    return async (req, res, next) => {
        try {
            const resourceId = req.params[resourceIdParam];
            const resource = await Model.findById(resourceId);
            
            if (!resource) {
                return next(new AppError('Resource not found', 404));
            }
            
            // Check if user owns the resource or is admin
            const isOwner = resource.organizer?.toString() === req.userId.toString() ||
                           resource.userId?.toString() === req.userId.toString() ||
                           resource._id.toString() === req.userId.toString();
            
            const isAdmin = req.user.role === 'admin';
            
            if (!isOwner && !isAdmin) {
                return next(new AppError('Access denied. You can only access your own resources.', 403));
            }
            
            // Add resource to request object
            req.resource = resource;
            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = {
    auth,
    authorize,
    optionalAuth,
    checkOwnership
};
