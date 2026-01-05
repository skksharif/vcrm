/**
 * TEAM LEAD PROFILE CONTROLLER
 * TeamLead profile, details, and assignment history
 */

const User = require('../../models/user');

/**
 * GET /api/teamlead/profile
 * Get logged-in team lead profile
 */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('assignmentHistory.assignedBy.id', 'name role')
      .populate('assignmentHistory.assignedTo.id', 'name role');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/teamlead/profile
 * Update team lead profile
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
 * GET /api/teamlead/profile/assignments
 * Get all assignments made by this team lead
 */
exports.getAssignmentHistory = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('assignmentHistory')
      .populate('assignmentHistory.taskId', 'title type currentStage')
      .populate('assignmentHistory.clientId', 'name')
      .populate('assignmentHistory.assignedTo.id', 'name role');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.assignmentHistory || []);
  } catch (error) {
    next(error);
  }
};
