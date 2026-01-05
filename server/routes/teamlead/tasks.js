/**
 * TEAM LEAD TASK ROUTES
 * Routes for TL-1 and TL-2 task management
 */

const express = require('express');
const router = express.Router();
const taskController = require('../../controllers/teamlead/taskController');

/* ============ TASK MANAGEMENT ============ */
router.get('/employees/workload', taskController.getEmployeeWorkload);
router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTaskById);
router.patch('/:id/updateStage', taskController.updateStage);
router.patch('/:id/approveSubmission', taskController.approveSubmission);
router.patch('/:id/rejectSubmission', taskController.rejectSubmission);

module.exports = router;
