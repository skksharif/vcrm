/**
 * EMPLOYEE PROFILE ROUTES
 * Routes for employee profile management
 */

const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/employee/profileController');

/* ============ PROFILE ============ */
router.get('/work-history', profileController.getWorkHistory);
router.get('/completed-tasks', profileController.getCompletedTasks);
router.get('/me', profileController.getProfile);
router.get('/', profileController.getProfile);
router.patch('/', profileController.updateProfile);

module.exports = router;
