/**
 * SOCIAL MEDIA MANAGER ROUTES
 * Routes for SMM task posting and profiles
 */

const express = require('express');
const router = express.Router();

// Import middlewares
const { verifyToken, checkNotSuspended, smmAccess } = require('../../middlewares/roleAuth');

// Import modular route handlers
const tasksRouter = require('./tasks');
const profileRouter = require('./profile');

// Apply authentication and authorization to all routes
router.use(verifyToken, checkNotSuspended, smmAccess);

// Mount modular routes
router.use('/tasks', tasksRouter);
router.use('/profile', profileRouter);

module.exports = router;
