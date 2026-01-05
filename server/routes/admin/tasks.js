/**
 * ADMIN TASK ROUTES
 * Routes for task management
 */

const express = require('express');
const router = express.Router();
const taskController = require('../../controllers/admin/taskController');

/* ============ TASK MANAGEMENT ============ */
router.post('/', taskController.createTask);
router.get('/deleted/all', taskController.getDeletedTasks);
router.get('/:id', taskController.getTaskById);
router.get('/', taskController.getTasks);
router.patch('/:id/reschedule', taskController.rescheduleTask);
router.patch('/:id/restore', taskController.restoreTask);
router.patch('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
