const User = require('../../models/user');

/* =====================================================
   1. CREATE USER
   ===================================================== */
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, role });

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   2. LIST USERS
   ===================================================== */
exports.listUsers = async (req, res, next) => {
  try {
    const includeDeleted =
      req.query.includeDeleted === 'true' && req.user.role === 'CEO';
    const roleFilter = req.query.role ? req.query.role : null;

    const filter = includeDeleted ? {} : { isDeleted: false };
    
    if (roleFilter) {
      filter.role = roleFilter;
    }

    const users = await User.find(filter).select('-password');

    res.json({ users });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   3. UPDATE USER
   ===================================================== */
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const user = await User.findById(id);
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (role) user.role = role;

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   4. SUSPEND USER
   ===================================================== */
exports.suspendUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.suspended = true;
    await user.save();

    res.json({ message: 'User suspended successfully' });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   5. SOFT DELETE USER
   ===================================================== */
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isDeleted = true;
    user.suspended = true;
    user.deletedAt = new Date();

    await user.save();

    res.json({ message: 'User deleted (soft)' });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   6. SHOW DELETED USERS
   ===================================================== */
exports.listDeletedUsers = async (req, res, next) => {
  try {
    if (req.user.role !== 'CEO') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const users = await User.find({ isDeleted: true }).select('-password');

    res.json({ users });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   7. COMPLETELY DELETE USER (HARD DELETE)
   ===================================================== */
exports.hardDeleteUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'CEO') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.deleteOne({ _id: id });

    res.json({ message: 'User permanently deleted' });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   8. ACTIVATE (RESTORE) DELETED USER
   ===================================================== */
exports.activateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user || !user.isDeleted) {
      return res.status(404).json({ message: 'User not found or not deleted' });
    }

    user.isDeleted = false;
    user.suspended = false;
    user.deletedAt = null;

    await user.save();

    res.json({ message: 'User activated successfully' });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   9. USER PROFILE (WORK HISTORY)
   ===================================================== */
exports.getUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select('-password')
      .populate('workLogs.taskId', 'title type currentStage')
      .populate('workLogs.clientId', 'name companyName');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        suspended: user.suspended,
        isDeleted: user.isDeleted,
        workSummary: {
          totalActions: user.workLogs.length,
          completedTasks: user.workLogs.filter(
            (l) => ['COMPLETED', 'DONE', 'POSTED'].includes(l.action)
          ).length
        },
        workLogs: user.workLogs
      }
    });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   10. REMOVE SUSPENSION (UNSUSPEND USER)
   ===================================================== */
exports.unsuspendUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.suspended) {
      return res.status(400).json({ message: 'User is not suspended' });
    }

    user.suspended = false;
    await user.save();

    res.json({ message: 'User unsuspended successfully' });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   11. LIST SUSPENDED USERS
   ===================================================== */
exports.listSuspendedUsers = async (req, res, next) => {
  try {
    const users = await User.find({
      suspended: true,
      isDeleted: false
    }).select('-password');

    res.json({ users });
  } catch (err) {
    next(err);
  }
};
/* =====================================================
   12. LIST SOFT-DELETED USERS (ADMIN VIEW)
   ===================================================== */
exports.listSoftDeletedUsersAdmin = async (req, res, next) => {
  try {
    const users = await User.find({ isDeleted: true })
      .select('-password');

    res.json({ users });
  } catch (err) {
    next(err);
  }
};
