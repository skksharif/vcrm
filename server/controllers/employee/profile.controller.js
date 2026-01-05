const User = require('../../models/user');

exports.getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('workLogs.taskId', 'title type currentStage')
      .populate('workLogs.clientId', 'name companyName');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const completed = user.workLogs.filter(
      (l) => ['COMPLETED', 'DONE', 'POSTED'].includes(l.action)
    ).length;

    res.json({
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        joinedAt: user.createdAt,

        stats: {
          totalActions: user.workLogs.length,
          completedTasks: completed
        },

        workTimeline: user.workLogs
      }
    });
  } catch (err) {
    next(err);
  }
};
