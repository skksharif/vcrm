const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'xxxyxxxxxyyyxxxyyyxxxyyy';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

/**
 * Generate JWT token
 */
const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    suspended: user.suspended,
    isDeleted: user.isDeleted
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

/**
 * Verify JWT token
 */
const verifyJWT = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Decode JWT without verification
 */
const decodeJWT = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyJWT,
  decodeJWT
};
