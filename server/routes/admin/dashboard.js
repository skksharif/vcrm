/**
 * ADMIN DASHBOARD ROUTES
 * Routes for dashboard metrics and analytics
 */

const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/admin/dashboardController');

/* ============ DASHBOARD ============ */
router.get('/', dashboardController.getDashboardMetrics);
router.get('/client-wise', dashboardController.getClientWiseProgress);
router.get('/teamlead-productivity', dashboardController.getTeamLeadProductivity);
router.get('/stage-bottlenecks', dashboardController.getStageBottlenecks);
router.get('/upcoming-tasks', dashboardController.getUpcomingTasks);

module.exports = router;
