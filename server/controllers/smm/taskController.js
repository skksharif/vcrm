/**
 * SOCIAL MEDIA MANAGER TASK CONTROLLER
 * SMM can view ready-to-post tasks and mark them as posted
 */

const Task = require('../../models/task');

/**
 * GET /api/smm/tasks
 * Get all tasks visible to SMM (including history)
 */
exports.getTasks = async (req, res, next) => {
  try {
    const { status } = req.query;

    let query = { isDeleted: false };

    if (status === 'ready') {
      query.currentStage = 'Ready to Post';
    } else if (status === 'posted') {
      query.currentStage = 'Posted';
    }

    const tasks = await Task.find(query)
      .populate('clientId', 'name companyName')
      .sort({ scheduledDate: 1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/smm/tasks/:id
 * Get specific task details
 */
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('clientId', 'name companyName')
      .populate('stageHistory.assignedBy.id', 'name role')
      .populate('stageHistory.assignedTo.id', 'name role');

    if (!task || task.isDeleted) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/smm/tasks/ready-to-post
 * Get tasks ready to be posted
 */
exports.getReadyToPostTasks = async (req, res, next) => {
  try {
    const { clientId } = req.query;

    let query = {
      currentStage: 'Ready to Post',
      isDeleted: false
    };

    if (clientId) {
      query.clientId = clientId;
    }

    const tasks = await Task.find(query)
      .populate('clientId', 'name companyName contactPerson contactEmail')
      .sort({ scheduledDate: 1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/smm/tasks/:id/post
 * Mark task as posted
 */
exports.markAsPosted = async (req, res, next) => {
  try {
    const { platform = '', link = '', remarks = '' } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task || task.isDeleted) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.currentStage !== 'Ready to Post') {
      return res.status(400).json({
        error: 'Only tasks in "Ready to Post" stage can be marked as posted'
      });
    }

    if (!platform || !link) {
      return res.status(400).json({
        error: 'Platform and link are required to mark as posted'
      });
    }

    task.markAsPosted(req.user.id, req.user.name, { platform, link, remarks });

    await task.save();

    res.json({
      message: 'Task marked as posted successfully',
      task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/smm/tasks/posted
 * Get all posted tasks (completed)
 */
exports.getPostedTasks = async (req, res, next) => {
  try {
    const { clientId } = req.query;

    let query = {
      currentStage: 'Posted',
      isDeleted: false
    };

    if (clientId) {
      query.clientId = clientId;
    }

    const tasks = await Task.find(query)
      .populate('clientId', 'name companyName')
      .sort({ postedAt: -1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};
