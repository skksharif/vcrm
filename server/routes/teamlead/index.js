/**
 * TEAM LEAD ROUTES
 * Routes for TL-1 and TL-2 task management and profiles
 */

const express = require('express');
const router = express.Router();

// Import middlewares
const { verifyToken, checkNotSuspended, teamLeadAccess } = require('../../middlewares/roleAuth');

// Import modular route handlers
const tasksRouter = require('./tasks');
const calendarRouter = require('./calendar');
const profileRouter = require('./profile');
const usersRouter = require('./users');

// Apply authentication and authorization to all routes
router.use(verifyToken, checkNotSuspended, teamLeadAccess);

// Mount modular routes
router.use('/tasks', tasksRouter);
router.use('/calendar', calendarRouter);
router.use('/profile', profileRouter);
router.use('/users', usersRouter);

module.exports = router;
