/**
 * SOCIAL MEDIA MANAGER PROFILE CONTROLLER
 * SMM profile and work history
 */

const User = require('../../models/user');
const Task = require('../../models/task');

/**
 * GET /api/smm/profile
 * Get logged-in SMM profile
 */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/smm/profile
 * Update SMM profile
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
 * GET /api/smm/profile/work-history
 * Get all posted tasks (work history)
 */
exports.getWorkHistory = async (req, res, next) => {
  try {
    const tasks = await Task.find({
      currentStage: 'Posted',
      isDeleted: false
    })
      .populate('clientId', 'name companyName')
      .sort({ postedAt: -1 })
      .lean();

    const stats = {
      totalPosted: tasks.length,
      thisMonth: tasks.filter(t => {
        const now = new Date();
        const taskDate = new Date(t.postedAt);
        return taskDate.getMonth() === now.getMonth() && 
               taskDate.getFullYear() === now.getFullYear();
      }).length,
      thisYear: tasks.filter(t => {
        const now = new Date();
        const taskDate = new Date(t.postedAt);
        return taskDate.getFullYear() === now.getFullYear();
      }).length
    };

    res.json({
      stats,
      workHistory: tasks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/smm/profile/statistics
 * Get SMM statistics
 */
exports.getStatistics = async (req, res, next) => {
  try {
    const allTasks = await Task.find({ isDeleted: false });
    const postedTasks = allTasks.filter(t => t.stageHistory.some(h => h.stage === 'Posted'));
    const readyToPost = allTasks.filter(t => t.currentStage === 'Ready to Post');

    res.json({
      readyToPostCount: readyToPost.length,
      postedCount: postedTasks.length,
      totalTasks: allTasks.length,
      completionRate: Math.round((postedTasks.length / (allTasks.length || 1)) * 100)
    });
  } catch (error) {
    next(error);
  }
};
