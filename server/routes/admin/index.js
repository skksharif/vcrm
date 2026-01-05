/**
 * ADMIN ROUTES
 * CEO-only routes for user, client, task, and dashboard management
 */

const express = require('express');
const router = express.Router();

// Import middlewares
const { verifyToken, checkNotSuspended, onlyCEO } = require('../../middlewares/roleAuth');

// Import modular route handlers
const usersRouter = require('./users');
const clientsRouter = require('./clients');
const tasksRouter = require('./tasks');
const calendarRouter = require('./calendar');
const dashboardRouter = require('./dashboard');
const profileRouter = require('./profile');

// Apply authentication and authorization to all routes
router.use(verifyToken, checkNotSuspended, onlyCEO);

// Mount modular routes
router.use('/profile', profileRouter);
router.use('/users', usersRouter);
router.use('/clients', clientsRouter);
router.use('/tasks', tasksRouter);
router.use('/calendar', calendarRouter);
router.use('/dashboard', dashboardRouter);

module.exports = router;
