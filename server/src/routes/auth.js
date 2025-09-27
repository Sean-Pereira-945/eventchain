const express = require('express');
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authValidators } = require('../utils/validators');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

const withIo = (factory) => (req, res, next) => factory(req.app.get('io'))(req, res, next);

router.post('/register', authLimiter, validate(authValidators.register), withIo(authController.register));
router.post('/login', authLimiter, validate(authValidators.login), authController.login);
router.post('/refresh', validate(authValidators.refresh), authController.refresh);
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, validate(authValidators.updateProfile), authController.updateProfile);
router.post('/change-password', auth, authController.changePassword);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', auth, authController.resendVerification);
router.post('/logout', auth, authController.logout);

module.exports = router;
