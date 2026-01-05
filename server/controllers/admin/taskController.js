/**
 * ADMIN TASK CONTROLLER
 * CEO can create, view, update, reschedule, and soft-delete tasks
 */

const Task = require('../../models/task');
const Client = require('../../models/client');
const { TASK_TYPES, INITIAL_TASK_STAGE } = require('../../models/constants');

/**
 * POST /api/admin/tasks
 * Create a new task
 */
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, type, clientId, scheduledDate } = req.body;

    // Validation
    if (!title || !type || !clientId || !scheduledDate) {
      return res.status(400).json({ error: 'Title, type, clientId, and scheduledDate required' });
    }

    if (!Object.values(TASK_TYPES).includes(type)) {
      return res.status(400).json({ error: 'Invalid task type' });
    }

    // Check if client exists and not deleted
    const client = await Client.findById(clientId);
    if (!client || client.isDeleted) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Create task
    const task = new Task({
      title,
      description: description || '',
      type,
      clientId,
      scheduledDate: new Date(scheduledDate),
      currentStage: INITIAL_TASK_STAGE,

    });

    task.initializeTask({
      id: req.user.id,
      name: req.user.name,
      role: req.user.role
    });

    await task.save();

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/tasks
 * Get all tasks (with filtering)
 */
exports.getTasks = async (req, res, next) => {
  try {
    const { clientId, stage, type, startDate, endDate } = req.query;

    let query = { isDeleted: false };

    if (clientId) {
      query.clientId = clientId;
    }

    if (stage) {
      query.currentStage = stage;
    }

    if (type) {
      query.type = type;
    }

    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) {
        query.scheduledDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.scheduledDate.$lte = new Date(endDate);
      }
    }

    const tasks = await Task.find(query)
      .populate('clientId', 'name companyName priority')
      .sort({ scheduledDate: 1 })
      .lean();

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/tasks/:id
 * Get specific task with full details
 */
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('clientId', 'name companyName email phone')
      .populate('currentAssignment.assignedBy.id', 'name email role')
      .populate('currentAssignment.assignedTo.id', 'name email role');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/tasks/:id
 * Update task details (title, description)
 */
exports.updateTask = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.isDeleted) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Only allow updates before task is posted
    if (task.currentStage === 'Posted') {
      return res.status(400).json({ error: 'Cannot update posted tasks' });
    }

    if (title) task.title = title;
    if (description !== undefined) task.description = description;


    task.auditLogs.push({
      action: 'TASK_UPDATED',
      by: {
        id: req.user.id,
        name: req.user.name,
        role: req.user.role
      }
    });

    await task.save();

    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/tasks/:id/reschedule
 * Reschedule task to different date
 */
exports.rescheduleTask = async (req, res, next) => {
  try {
    const { scheduledDate } = req.body;

    if (!scheduledDate) {
      return res.status(400).json({ error: 'New scheduled date required' });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.isDeleted) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const oldDate = task.scheduledDate;
    task.scheduledDate = new Date(scheduledDate);

    task.auditLogs.push({
      action: 'TASK_RESCHEDULED',
      by: {
        id: req.user.id,
        name: req.user.name,
        role: req.user.role
      },
      details: `Rescheduled from ${oldDate.toISOString()} to ${task.scheduledDate.toISOString()}`
    });

    await task.save();

    res.json({
      message: 'Task rescheduled successfully',
      task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/tasks/:id
 * Soft delete a task
 */
exports.deleteTask = async (req, res, next) => {
  try {
    const { reason } = req.body || {};

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.isDeleted) {
      return res.status(400).json({ error: 'Task already deleted' });
    }

    task.softDelete(req.user.id, req.user.name, reason || '');

    await task.save();

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/tasks/deleted/all
 * Get all soft-deleted tasks
 */
exports.getDeletedTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ isDeleted: true })
      .populate('clientId', 'name companyName')
      .sort({ deletedAt: -1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/tasks/:id/restore
 * Restore soft-deleted task
 */
exports.restoreTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (!task.isDeleted) {
      return res.status(400).json({ error: 'Task is not deleted' });
    }

    task.isDeleted = false;
    task.deletedAt = null;

    task.auditLogs.push({
      action: 'TASK_RESTORED',
      by: {
        id: req.user.id,
        name: req.user.name,
        role: req.user.role
      }
    });

    await task.save();

    res.json({ message: 'Task restored successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/tasks/calendar/global
 * Get tasks for global calendar (all clients)
 */
exports.getGlobalCalendarTasks = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const tasks = await Task.find({
      isDeleted: false,
      scheduledDate: {
        $gte: startDate,
        $lte: endDate
      }
    })
      .populate('clientId', 'name')
      .sort({ scheduledDate: 1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/tasks/calendar/:clientId
 * Get tasks for specific client calendar
 */
exports.getClientCalendarTasks = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const { clientId } = req.params;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const tasks = await Task.find({
      clientId,
      isDeleted: false,
      scheduledDate: {
        $gte: startDate,
        $lte: endDate
      }
    })
      .populate('clientId', 'name')
      .sort({ scheduledDate: 1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};
