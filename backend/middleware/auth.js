const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const loadAccountFromToken = async (decoded) => {
  if (decoded.type === 'admin') {
    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin) return null;

    return {
      ...admin.toObject(),
      role: 'admin',
      status: 'approved',
      accountType: 'admin',
    };
  }

  const user = await User.findById(decoded.id).select('-password');
  if (!user) return null;

  return {
    ...user.toObject(),
    accountType: 'user',
  };
};

/**
 * authMiddleware — Verifies JWT token and attaches user to req
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired. Please log in again.',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }

    const user = await loadAccountFromToken(decoded);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
    });
  }
};

/**
 * authorizeRoles — Restricts route access by role
 * Usage: authorizeRoles('admin') or authorizeRoles('admin', 'superadmin')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}.`,
      });
    }

    next();
  };
};

/**
 * checkApproval — Blocks non-approved users from accessing protected routes
 * Must be used AFTER authMiddleware
 */
const checkApproval = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  // Admins bypass approval check
  if (req.user.role === 'admin') return next();

  if (req.user.status === 'pending') {
    return res.status(403).json({
      success: false,
      message: 'Your account is pending admin approval.',
      status: 'pending',
    });
  }

  if (req.user.status === 'rejected') {
    return res.status(403).json({
      success: false,
      message: 'Your account has been rejected. Please contact support.',
      status: 'rejected',
    });
  }

  if (req.user.status !== 'approved') {
    return res.status(403).json({
      success: false,
      message: 'Account access restricted.',
      status: req.user.status,
    });
  }

  next();
};

module.exports = { authMiddleware, authorizeRoles, checkApproval };
