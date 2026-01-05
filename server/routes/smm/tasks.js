/**
 * SMM TASK ROUTES
 * Routes for SMM task posting and management
 */

const express = require('express');
const router = express.Router();
const taskController = require('../../controllers/smm/taskController');

/* ============ TASK MANAGEMENT ============ */
router.get('/ready-to-post', taskController.getReadyToPostTasks);
router.get('/posted', taskController.getPostedTasks);
router.get('/:id', taskController.getTaskById);
router.get('/', taskController.getTasks);
router.patch('/:id/post', taskController.markAsPosted);

module.exports = router;
