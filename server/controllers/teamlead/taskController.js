/**
 * TEAM LEAD TASK CONTROLLER
 * TL-1 and TL-2 can update stages, assign tasks, approve/reject work
 */

const Task = require('../../models/task');
const User = require('../../models/user');
const { POSTER_STAGES, REEL_STAGES, INITIAL_TASK_STAGE } = require('../../models/constants');

const getStagesByType = (type) => (type === 'poster' ? POSTER_STAGES : REEL_STAGES);

/**
 * GET /api/teamlead/tasks
 * Get all tasks visible to team lead
 */
exports.getTasks = async (req, res, next) => {
  try {
    const { clientId, stage } = req.query;

    const query = { isDeleted: false };
    if (clientId) query.clientId = clientId;
    if (stage) query.currentStage = stage;

    const tasks = await Task.find(query)
      .populate('clientId', 'name companyName')
      .populate('stageHistory.assignedBy.id', 'name role email')
      .populate('stageHistory.assignedTo.id', 'name role email')
      .populate('currentAssignment.assignedBy.id', 'name role email')
      .populate('currentAssignment.assignedTo.id', 'name role email')
      .sort({ updatedAt: -1 });

    const shaped = tasks.map((task) => {
      const plain = task.toObject({ virtuals: true });
      return {
        ...plain,
        stage: task.currentStage
      };
    });

    res.json({ tasks: shaped });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/teamlead/tasks/employees/workload
 * Get all employees with their assigned task counts
 */
exports.getEmployeeWorkload = async (req, res, next) => {
  try {
    // Get all active employees
    const employees = await User.find({
      role: 'Employee',
      isDeleted: false,
      suspended: false
    }).select('name email role');

    // For each employee, count their assigned tasks by status
    const employeeWorkload = await Promise.all(
      employees.map(async (emp) => {
        const assignedTasks = await Task.find({
          'currentAssignment.assignedTo.id': emp._id,
          isDeleted: false
        });

        const completedTasks = assignedTasks.filter(t => t.stageHistory.some(h => h.stage === 'Posted')).length;
        const inProgressTasks = assignedTasks.length - completedTasks;

        return {
          _id: emp._id,
          name: emp.name,
          email: emp.email,
          role: emp.role,
          assignedTasks: assignedTasks.length,
          completedTasks,
          inProgressTasks
        };
      })
    );

    res.json({ employees: employeeWorkload });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/teamlead/tasks/:id
 * Get specific task with history
 */
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('clientId', 'name companyName')
      .populate('stageHistory.assignedBy.id', 'name email role')
      .populate('stageHistory.assignedTo.id', 'name email role')
      .populate('currentAssignment.assignedBy.id', 'name email role')
      .populate('currentAssignment.assignedTo.id', 'name email role');

    if (!task || task.isDeleted) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ task });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/teamlead/tasks/:id/stage
 * Update task stage and assign to employee or self
 */
exports.updateStage = async (req, res, next) => {
  try {
    console.log('[updateStage] Request from user:', {
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role
    });

    const { stage, remarks } = req.body;
    const assignToId = req.body.employeeId || req.body.assignToId;

    console.log('[updateStage] Request body:', { stage, assignToId, remarks });

    if (!stage) {
      return res.status(400).json({ error: 'New stage required' });
    }

    const task = await Task.findById(req.params.id);
    console.log('[updateStage] Task found:', { taskId: task?._id, taskType: task?.type, currentStage: task?.currentStage });

    if (!task || task.isDeleted) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Validate stage based on TL role and task type
    // TL-1 handles posters: Content Writing through Design Client Approval
    // TL-2 handles reels: Content Writing through Ready to Post
    const isClientApprovalStage = stage.toLowerCase().includes('client approval');
    console.log('[updateStage] Stage validation:', { stage, isClientApprovalStage });

    if (req.user.role === 'TL-1') {
      if (task.type === 'poster') {
        // TL-1: up to Designing (no client approvals)
        const tlStages = ['Content Writing', 'Designing'];
        if (!tlStages.includes(stage)) {
          console.log('[updateStage] TL-1 stage validation failed for poster');
          return res.status(403).json({
            error: 'TL-1 can only manage Content Writing and Designing for poster tasks'
          });
        }
      } else if (task.type === 'reel') {
        // TL-1: up to Editing for reels
        const tlStages = ['Content Writing', 'Content Client Approval', 'Shooting', 'Editing'];
        if (!tlStages.includes(stage)) {
          console.log('[updateStage] TL-1 stage validation failed for reel');
          return res.status(403).json({
            error: 'TL-1 can only manage Content Writing, Content Client Approval, Shooting, and Editing for reel tasks'
          });
        }
      }
    }

    if (req.user.role === 'TL-2') {
      if (task.type === 'poster') {
        // TL-2: from Design Client Approval to Ready to Post
        const tlStages = ['Design Client Approval', 'Ready to Post'];
        if (!tlStages.includes(stage)) {
          console.log('[updateStage] TL-2 stage validation failed for poster');
          return res.status(403).json({
            error: 'TL-2 can only manage Design Client Approval and Ready to Post for poster tasks'
          });
        }
      } else if (task.type === 'reel') {
        // TL-2: from Editing Client Approval to Ready to Post
        const tlStages = ['Editing Client Approval', 'Ready to Post'];
        if (!tlStages.includes(stage)) {
          console.log('[updateStage] TL-2 stage validation failed for reel');
          return res.status(403).json({
            error: 'TL-2 can only manage Editing Client Approval and Ready to Post for reel tasks'
          });
        }
      }
    }

    if (req.user.role === 'SMM') {
      // SMM: can mark as Posted to end the task
      if (stage !== 'Posted') {
        console.log('[updateStage] SMM attempted invalid stage change');
        return res.status(403).json({
          error: 'SMM can only mark tasks as Posted'
        });
      }
    }

    // Assignment is not required for client approval stages, Ready to Post, or Posted (handled by SMM)
    const skipAssignment = isClientApprovalStage || stage === 'Ready to Post' || stage === 'Posted';

    let assignedTo = null;
    if (!skipAssignment) {
      if (!assignToId) {
        console.log('[updateStage] No assignee provided for non-approval stage');
        return res.status(400).json({ error: 'Assignee required for this stage' });
      }

      console.log('[updateStage] Fetching assignee:', assignToId);
      const assignee = await User.findById(assignToId);
      console.log('[updateStage] Assignee found:', { assigneeId: assignee?._id, role: assignee?.role, suspended: assignee?.suspended });

      if (!assignee || assignee.role !== 'Employee') {
        console.log('[updateStage] Invalid assignee - not an Employee');
        return res.status(400).json({ error: 'Invalid assignee' });
      }

      if (assignee.suspended || assignee.isDeleted) {
        console.log('[updateStage] Assignee is suspended or deleted');
        return res.status(400).json({ error: 'Cannot assign to suspended or deleted user' });
      }

      assignedTo = { id: assignee._id, name: assignee.name };
    }

    console.log('[updateStage] Updating task stage:', { assignedTo, stage });
    task.updateStageAndAssign(
      stage,
      { id: req.user.id, name: req.user.name, role: req.user.role },
      assignedTo,
      remarks || ''
    );

    await task.save();
    console.log('[updateStage] Task saved successfully');

    res.json({
      message: 'Stage updated successfully',
      task
    });
  } catch (error) {
    console.error('[updateStage] Error:', error);
    if (!error.status && !error.statusCode) {
      // Treat validation and flow errors from model as bad requests
      error.status = 400;
    }
    next(error);
  }
};

/**
 * PATCH /api/teamlead/tasks/:id/approve
 * Approve work submission and move to next stage
 */
exports.approveSubmission = async (req, res, next) => {
  try {
    const { remarks } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task || task.isDeleted) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const stages = getStagesByType(task.type);
    const currentIndex = stages.indexOf(task.currentStage);
    const nextStage = stages[currentIndex + 1] || stages[currentIndex];

    task.approveAndMove(
      req.user.id,
      req.user.name,
      req.user.role,
      nextStage,
      remarks || ''
    );

    await task.save();

    res.json({
      message: 'Work approved and task moved to next stage',
      task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/teamlead/tasks/:id/reject
 * Reject work and send back to previous stage
 */
exports.rejectSubmission = async (req, res, next) => {
  try {
    const { remarks, reason } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task || task.isDeleted) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.rejectWork(
      req.user.id,
      req.user.name,
      req.user.role,
      remarks || reason || ''
    );

    await task.save();

    res.json({
      message: 'Work rejected and task reverted to previous stage',
      task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/teamlead/tasks/calendar/global
 * Get global calendar tasks (all clients)
 */
exports.getGlobalCalendar = async (req, res, next) => {
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
 * GET /api/teamlead/tasks/calendar/:clientId
 * Get client-specific calendar tasks
 */
exports.getClientCalendar = async (req, res, next) => {
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
