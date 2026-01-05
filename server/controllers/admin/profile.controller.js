const User = require('../../models/user');

exports.getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('assignmentHistory.taskId', 'title type')
      .populate('assignmentHistory.clientId', 'name companyName');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Count completed assignments
    const completed = user.assignmentHistory.filter(
      (h) => ['completed', 'approved'].includes(h.status)
    ).length;

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        joinedAt: user.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};
