const mongoose = require('mongoose');
const Task = require('../../models/task');

/* =====================================================
   1. VIEW ASSIGNED TASKS
   ===================================================== */
exports.listMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.aggregate([
      { $match: { isDeleted: false } },
      { $addFields: { currentStageEntry: { $arrayElemAt: ['$stageHistory', -1] } } },
      { $match: { 'currentStageEntry.assignedTo.id': new mongoose.Types.ObjectId(req.user._id) } },
      { $sort: { updatedAt: -1 } }
    ]);

    const shaped = tasks.map((t) => ({ ...t, stage: t.currentStage }));

    res.json({ tasks: shaped });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   2. VIEW TASK DETAILS
   ===================================================== */
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('stageHistory.assignedBy', 'name role')
      .populate('stageHistory.assignedTo', 'name role');

    if (!task || task.isDeleted) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const current = task.getCurrentStageEntry();
    if (!current || String(current.assignedTo) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not assigned to you' });
    }

    res.json({ task });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   3. SUBMIT WORK
   ===================================================== */
exports.submitWork = async (req, res, next) => {
  try {
    const { remarks = '' } = req.body;

    const task = await Task.findById(req.params.taskId);

    if (!task || task.isDeleted) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const current = task.getCurrentStageEntry();
    if (!current || String(current.assignedTo) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not assigned to you' });
    }

    await task.addAuditLog('WORK_SUBMITTED', req.user._id, remarks);

    res.json({ message: 'Work submitted successfully' });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   4. RESUBMIT WORK (AFTER REJECTION)
   ===================================================== */
exports.resubmitWork = async (req, res, next) => {
  try {
    const { remarks = '' } = req.body;

    const task = await Task.findById(req.params.taskId);

    if (!task || task.isDeleted) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    const current = task.getCurrentStageEntry();
    if (!current || String(current.assignedTo) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not assigned to you' });
    }

    await task.addAuditLog('WORK_RESUBMITTED', req.user._id, remarks);

    res.json({ message: 'Work resubmitted successfully' });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   5. VIEW FEEDBACK / REMARKS
   ===================================================== */
exports.viewFeedback = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('stageHistory.assignedBy', 'name role')
      .populate('stageHistory.assignedTo', 'name role');

    if (!task || task.isDeleted) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const current = task.getCurrentStageEntry();
    if (!current || String(current.assignedTo) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not assigned to you' });
    }

    res.json({
      stage: task.currentStage,
      remarksHistory: task.stageHistory.map((h) => ({
        stage: h.stage,
        remarks: h.remarks,
        by: h.assignedBy,
        at: h.changedAt
      }))
    });
  } catch (err) {
    next(err);
  }
};
