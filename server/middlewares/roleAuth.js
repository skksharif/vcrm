/**
 * Role-Based Access Control Middleware
 * Protects routes and ensures only authorized roles can access
 */

const { ROLES } = require('../models/constants');

/**
 * Verify JWT and attach user to request
 */
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Check if user is not suspended
 */
const checkNotSuspended = (req, res, next) => {
  if (req.user.suspended) {
    return res.status(403).json({ error: 'Your account is suspended' });
  }
  if (req.user.isDeleted) {
    return res.status(403).json({ error: 'Your account has been deleted' });
  }
  next();
};

/**
 * Role-based authorization
 * Usage: authorize([ROLES.CEO, ROLES.HR])
 */
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden: You do not have permission to access this resource'
      });
    }

    next();
  };
};

/**
 * Only CEO can access
 */
const onlyCEO = authorize([ROLES.CEO]);

/**
 * CEO, HR, or GM can access
 */
const adminAccess = authorize([ROLES.CEO, ROLES.HR, ROLES.GM]);

/**
 * Team Leads can access
 */
const teamLeadAccess = authorize([ROLES.TL_1, ROLES.TL_2, ROLES.CEO]);

/**
 * Employees can access
 */
const employeeAccess = authorize([ROLES.EMPLOYEE, ROLES.CEO]);

/**
 * SMM can access
 */
const smmAccess = authorize([ROLES.SMM, ROLES.CEO]);

/**
 * Middleware for entire route file
 */
const requireAuth = [verifyToken, checkNotSuspended];

module.exports = {
  verifyToken,
  checkNotSuspended,
  authorize,
  onlyCEO,
  adminAccess,
  teamLeadAccess,
  employeeAccess,
  smmAccess,
  requireAuth
};
