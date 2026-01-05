/**
 * EMPLOYEE ROUTES
 * Routes for employee task management and profiles
 */

const express = require('express');
const router = express.Router();

// Import middlewares
const { verifyToken, checkNotSuspended, employeeAccess } = require('../../middlewares/roleAuth');

// Import modular route handlers
const tasksRouter = require('./tasks');
const profileRouter = require('./profile');

// Apply authentication and authorization to all routes
router.use(verifyToken, checkNotSuspended, employeeAccess);

// Mount modular routes
router.use('/tasks', tasksRouter);
router.use('/profile', profileRouter);

module.exports = router;
