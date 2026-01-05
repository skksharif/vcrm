/**
 * ADMIN CALENDAR ROUTES
 * Routes for calendar management
 */

const express = require('express');
const router = express.Router();
const taskController = require('../../controllers/admin/taskController');

/* ============ CALENDAR ============ */
router.get('/global', taskController.getGlobalCalendarTasks);
router.get('/:clientId', taskController.getClientCalendarTasks);

module.exports = router;
