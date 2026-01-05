/**
 * TEAM LEAD CALENDAR ROUTES
 * Routes for TL-1 and TL-2 calendar management
 */

const express = require('express');
const router = express.Router();
const taskController = require('../../controllers/teamlead/taskController');

/* ============ CALENDAR ============ */
router.get('/global', taskController.getGlobalCalendar);
router.get('/:clientId', taskController.getClientCalendar);

module.exports = router;
