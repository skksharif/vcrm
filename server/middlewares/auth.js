const jwt = require('jsonwebtoken');
const User = require('../models/user');

/**
 * Auth middleware
 * - Expects Authorization: Bearer <token>
 * - Verifies JWT and loads the user
 * - Rejects suspended or soft-deleted users
 */
async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [, token] = header.split(' ');

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const secret = process.env.JWT_SECRET || 'your_jwt_secret_key';
    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const user = await User.findById(payload.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.suspended) {
      return res.status(403).json({ message: 'User suspended' });
    }

    if (user.isDeleted) {
      return res.status(403).json({ message: 'User deleted' });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { authMiddleware };