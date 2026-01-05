/**
 * EMPLOYEE TASK ROUTES
 * Routes for employee task management
 */

const express = require('express');
const router = express.Router();
const taskController = require('../../controllers/employee/taskController');

/* ============ TASK MANAGEMENT ============ */
router.get('/pending/acceptance', taskController.getPendingAcceptance);
router.get('/:id', taskController.getTaskById);
router.get('/', taskController.getAssignedTasks);
router.patch('/:id/accept', taskController.acceptTask);
router.patch('/:id/reject', taskController.rejectTask);
router.patch('/:id/submit', taskController.submitWork);

module.exports = router;
