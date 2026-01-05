/**
 * ADMIN DASHBOARD CONTROLLER
 * CEO dashboard with overall metrics and statistics
 */

const Task = require('../../models/task');
const Client = require('../../models/client');
const User = require('../../models/user');
const { ROLES } = require('../../models/constants');

/**
 * GET /api/admin/dashboard
 * Minimal dashboard metrics for admin home
 */
exports.getDashboardMetrics = async (req, res, next) => {
  try {
    const clients = await Client.countDocuments({ isDeleted: false });
    const teamMembers = await User.countDocuments({ isDeleted: false, suspended: { $ne: true } });
    
    const allTasks = await Task.find({ isDeleted: false });
    const completedTasks = allTasks.filter(t => t.stageHistory.some(h => h.stage === 'Posted')).length;

    res.json({
      totalClients: clients,
      teamMembers,
      completedTasks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/dashboard/client-wise
 * Get progress by client
 */
exports.getClientWiseProgress = async (req, res, next) => {
  try {
    const clients = await Client.find({ isDeleted: false }).lean();

    const clientProgress = await Promise.all(
      clients.map(async (client) => {
        const tasks = await Task.find({
          clientId: client._id,
          isDeleted: false
        });

        const completed = tasks.filter(t => t.stageHistory.some(h => h.stage === 'Posted')).length;
        const pending = tasks.filter(t => t.currentStage === 'Not Started Yet').length;
        const inProgress = tasks.length - completed - pending;

        return {
          clientId: client._id,
          clientName: client.name,
          priority: client.priority,
          totalTasks: tasks.length,
          completed,
          inProgress,
          pending,
          completionPercentage: Math.round((completed / (tasks.length || 1)) * 100)
        };
      })
    );

    res.json(clientProgress.sort((a, b) => b.completionPercentage - a.completionPercentage));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/dashboard/teamlead-productivity
 * Get Team Lead productivity metrics
 */
exports.getTeamLeadProductivity = async (req, res, next) => {
  try {
    const teamLeads = await User.find({
      role: { $in: ['TL-1', 'TL-2'] },
      isDeleted: false
    }).lean();

    const productivity = await Promise.all(
      teamLeads.map(async (tl) => {
        // Find all assignments made by this team lead
        const tasksAssignedBy = await Task.find({
          'stageHistory.assignedBy.id': tl._id,
          isDeleted: false
        });

        const completed = tasksAssignedBy.filter(t => t.stageHistory.some(h => h.stage === 'Posted')).length;

        return {
          teamLeadId: tl._id,
          teamLeadName: tl.name,
          role: tl.role,
          tasksAssigned: tasksAssignedBy.length,
          tasksCompleted: completed,
          completionRate: Math.round((completed / (tasksAssignedBy.length || 1)) * 100)
        };
      })
    );

    res.json(productivity.sort((a, b) => b.completionRate - a.completionRate));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/dashboard/stage-bottlenecks
 * Identify bottlenecks in workflow
 */
exports.getStageBottlenecks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ isDeleted: false });

    // Group tasks by current stage
    const stageBreakdown = {};

    tasks.forEach(task => {
      if (!stageBreakdown[task.currentStage]) {
        stageBreakdown[task.currentStage] = {
          stage: task.currentStage,
          count: 0,
          tasks: []
        };
      }
      stageBreakdown[task.currentStage].count++;
      stageBreakdown[task.currentStage].tasks.push({
        id: task._id,
        title: task.title,
        clientId: task.clientId,
        assignedTo: task.currentAssignment?.assignedTo?.name || 'Unassigned',
        days: Math.floor((Date.now() - task.updatedAt) / (1000 * 60 * 60 * 24))
      });
    });

    // Convert to array and sort by count (bottlenecks)
    const bottlenecks = Object.values(stageBreakdown)
      .sort((a, b) => b.count - a.count);

    res.json(bottlenecks);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/dashboard/upcoming-tasks
 * Get upcoming tasks (scheduled for next 7 days)
 */
exports.getUpcomingTasks = async (req, res, next) => {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingTasks = await Task.find({
      isDeleted: false,
      scheduledDate: {
        $gte: now,
        $lte: sevenDaysFromNow
      }
    })
      .populate('clientId', 'name')
      .sort({ scheduledDate: 1 });

    res.json(upcomingTasks);
  } catch (error) {
    next(error);
  }
};
