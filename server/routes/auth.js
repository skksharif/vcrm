const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken, checkNotSuspended } = require('../middlewares/roleAuth');

// Public routes
router.post('/login', authController.login);

// Protected routes
router.get('/me', verifyToken, checkNotSuspended, authController.getMe);
router.patch('/me', verifyToken, checkNotSuspended, authController.updateProfile);
router.patch('/change-password', verifyToken, checkNotSuspended, authController.changePassword);

module.exports = router;
