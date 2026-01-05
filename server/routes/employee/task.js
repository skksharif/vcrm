const express = require('express');
const router = express.Router();
const controller = require('../../controllers/employee/task.controller');

router.get('/tasks', controller.listMyTasks);
router.get('/tasks/:taskId', controller.getTask);

router.patch('/tasks/:taskId/submit', controller.submitWork);
router.patch('/tasks/:taskId/resubmit', controller.resubmitWork);

router.get('/tasks/:taskId/feedback', controller.viewFeedback);

module.exports = router;
