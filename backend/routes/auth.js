const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate, userValidation } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/auth');

router.post('/register',
    authLimiter,
    validate(userValidation.register),
    authController.register
);

router.post('/login',
    authLimiter,
    validate(userValidation.login),
    authController.login
);

router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;