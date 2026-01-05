const Task = require("../../models/task");
const Client = require("../../models/client");
const { TASK_TYPES } = require("../../models/constants");

/* =====================================================
   1. CREATE TASK
   ===================================================== */
exports.createTask = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id: clientId } = req.params;
    const { title, type, scheduledDate, assignedTo } = req.body;

    if (!title || !type || !scheduledDate || !assignedTo) {
      return res.status(400).json({
        message: "title, type, scheduledDate and assignedTo are required",
      });
    }

    if (!Object.values(TASK_TYPES).includes(type)) {
      return res.status(400).json({ message: "Invalid task type" });
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const task = new Task({
      clientId,
      title,
      type,
      scheduledDate: new Date(scheduledDate)
    });

    await task.initializeTask(req.user._id, assignedTo, 'Task created with initial assignment');

    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   2. LIST TASKS (CALENDAR VIEW)
   ===================================================== */
exports.listTasks = async (req, res, next) => {
  try {
    const { id: clientId } = req.params;
    const { month, year } = req.query;

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const filter = {
      clientId,
      isDeleted: false,
    };

    const tasks = await Task.find(filter).sort({ scheduledDate: 1 });

    res.json({
      calendar: tasks.map((t) => ({
        id: t._id,
        title: t.title,
        date: t.scheduledDate, // 🔥 REQUIRED
        type: t.type,
        stage: t.currentStage
      })),
    });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   3. GET TASK (FULL DETAILS)
   ===================================================== */
exports.getTask = async (req, res, next) => {
  try {
    const { id: clientId, taskId } = req.params;

    const task = await Task.findOne({
      _id: taskId,
      clientId,
      isDeleted: false,
    })
      .populate('stageHistory.assignedTo', 'name email role')
      .populate('stageHistory.assignedBy', 'name email role');

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ task });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   4. UPDATE TASK
   ===================================================== */
exports.updateTask = async (req, res, next) => {
  try {
    const { id: clientId, taskId } = req.params;
    const updates = req.body;

    delete updates.currentStage;
    delete updates.clientId;
    delete updates.isDeleted;

    const task = await Task.findOne({
      _id: taskId,
      clientId,
      isDeleted: false,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    Object.assign(task, updates);

    await task.addAuditLog("TASK_UPDATED", req.user._id, "Admin updated task");

    await task.save();

    res.json({ task });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   5. DELETE TASK (SOFT DELETE)
   ===================================================== */
exports.deleteTask = async (req, res, next) => {
  try {
    const { id: clientId, taskId } = req.params;

    const task = await Task.findOne({
      _id: taskId,
      clientId,
      isDeleted: false,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await task.softDelete(req.user._id, "Deleted by admin");

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   6. LIST DELETED TASKS
   ===================================================== */
exports.listDeletedTasks = async (req, res, next) => {
  try {
    const { id: clientId } = req.params;

    const tasks = await Task.find({
      clientId,
      isDeleted: true,
    }).sort({ deletedAt: -1 });

    res.json({ tasks });
  } catch (err) {
    next(err);
  }
};
