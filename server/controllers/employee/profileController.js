/**
 * EMPLOYEE PROFILE CONTROLLER
 * Employee profile and work history
 */

const User = require('../../models/user');
const Task = require('../../models/task');

/**
 * GET /api/employee/profile
 * Get logged-in employee profile
 */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('assignmentHistory.taskId', 'title type currentStage');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/employee/profile
 * Update employee profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, department, profileImage } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (department !== undefined) user.department = department;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/employee/profile/work-history
 * Get all work done by employee
 */
exports.getWorkHistory = async (req, res, next) => {
  try {
    const tasks = await Task.find({
      'stageHistory.assignedTo.id': req.user.id
    })
      .populate('clientId', 'name')
      .populate('currentAssignment.assignedBy.id', 'name')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate summary stats
    const totalAssignments = tasks.length;
    const completedTasks = tasks.filter(t => t.stageHistory.some(h => h.stage === 'Posted')).length;
    const submittedTasks = tasks.filter(t => 
      t.stageHistory.some(h => h.status === 'submitted')
    ).length;

    res.json({
      stats: {
        totalAssignments,
        completedTasks,
        submittedTasks,
        inProgress: totalAssignments - completedTasks - submittedTasks
      },
      workHistory: tasks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/employee/profile/completed-tasks
 * Get all completed tasks
 */
exports.getCompletedTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({
      'stageHistory.assignedTo.id': req.user.id,
      currentStage: 'Posted'
    })
      .populate('clientId', 'name companyName')
      .sort({ postedAt: -1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};
