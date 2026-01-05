/**
 * TEAM LEAD USER CONTROLLER
 * Controller for team lead user-related operations
 */

const User = require('../../models/user');

/* =====================================================
   1. LIST USERS
   ===================================================== */
exports.listUsers = async (req, res, next) => {
  try {
    const roleFilter = req.query.role ? req.query.role : null;

    const filter = { isDeleted: false };
    
    if (roleFilter) {
      filter.role = roleFilter;
    }

    const users = await User.find(filter).select('-password');

    res.json({ users });
  } catch (err) {
    next(err);
  }
};
