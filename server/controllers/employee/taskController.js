/**
 * EMPLOYEE TASK CONTROLLER
 * Employees can view assigned tasks, accept/reject, and submit work
 */

const Task = require('../../models/task');

/**
 * GET /api/employee/tasks
 * Get all tasks assigned to the employee
 */
exports.getAssignedTasks = async (req, res, next) => {
  try {
    const { status } = req.query;

    let query = {
      'currentAssignment.assignedTo.id': req.user.id,
      isDeleted: false
    };

    if (status) {
      query['currentAssignment.acceptanceStatus'] = status;
    }

    const tasks = await Task.find(query)
      .populate('clientId', 'name companyName')
      .populate('currentAssignment.assignedBy.id', 'name role')
      .sort({ scheduledDate: 1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/employee/tasks/:id
 * Get specific task details
 */
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('clientId', 'name companyName email')
      .populate('currentAssignment.assignedBy.id', 'name email role')
      .populate('stageHistory.assignedBy.id', 'name role')
      .populate('stageHistory.assignedTo.id', 'name role');

    if (!task || task.isDeleted) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if assigned to this employee
    if (!task.currentAssignment.assignedTo?.id.equals(req.user.id)) {
      return res.status(403).json({ error: 'Not assigned to you' });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/employee/tasks/:id/accept
 * Accept task assignment
 */
exports.acceptTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task || task.isDeleted) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (!task.currentAssignment.assignedTo?.id.equals(req.user.id)) {
      return res.status(403).json({ error: 'Not assigned to you' });
    }

    if (task.currentAssignment.acceptanceStatus !== 'pending') {
      return res.status(400).json({ error: 'Task already processed' });
    }

    task.acceptAssignment(req.user.id, req.user.name);

    await task.save();

    res.json({
      message: 'Task accepted successfully',
      task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/employee/tasks/:id/reject
 * Reject task assignment
 */
exports.rejectTask = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task || task.isDeleted) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (!task.currentAssignment.assignedTo?.id.equals(req.user.id)) {
      return res.status(403).json({ error: 'Not assigned to you' });
    }

    if (task.currentAssignment.acceptanceStatus !== 'pending') {
      return res.status(400).json({ error: 'Task already processed' });
    }

    task.rejectAssignment(req.user.id, req.user.name, reason || '');

    await task.save();

    res.json({
      message: 'Task rejected successfully',
      task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/employee/tasks/:id/submit
 * Submit completed work for approval
 */
exports.submitWork = async (req, res, next) => {
  try {
    const { workDetails } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task || task.isDeleted) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (!task.currentAssignment.assignedTo?.id.equals(req.user.id)) {
      return res.status(403).json({ error: 'Not assigned to you' });
    }

    if (task.currentAssignment.acceptanceStatus !== 'accepted') {
      return res.status(400).json({ error: 'Task not accepted yet' });
    }

    task.submitWork(req.user.id, req.user.name, workDetails || '');

    await task.save();

    res.json({
      message: 'Work submitted successfully',
      task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/employee/tasks/pending/acceptance
 * Get tasks pending acceptance
 */
exports.getPendingAcceptance = async (req, res, next) => {
  try {
    const tasks = await Task.find({
      'currentAssignment.assignedTo.id': req.user.id,
      'currentAssignment.acceptanceStatus': 'pending',
      isDeleted: false
    })
      .populate('clientId', 'name')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};
