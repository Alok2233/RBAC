const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const generateToken = (accountId, accountType) => {
  return jwt.sign({ id: accountId, type: accountType }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const serializeAccount = (account, accountType) => {
  const isAdmin = accountType === 'admin';

  return {
    id: account._id,
    name: account.name,
    email: account.email,
    role: isAdmin ? 'admin' : account.role,
    status: isAdmin ? 'approved' : account.status,
    createdAt: account.createdAt,
    lastLogin: account.lastLogin || null,
    accountType,
  };
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email && String(email).toLowerCase().trim();

    const [existingUser, existingAdmin] = await Promise.all([
      User.findOne({ email: normalizedEmail }),
      Admin.findOne({ email: normalizedEmail }),
    ]);
    if (existingUser || existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: 'user',
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Your account is pending admin approval.',
      data: {
        user: serializeAccount(user, 'user'),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email && String(email).toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    const admin = user ? null : await Admin.findOne({ email: normalizedEmail }).select('+password');
    const account = user || admin;
    const accountType = admin ? 'admin' : 'user';

    if (!account) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Auth login: account not found for', normalizedEmail);
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await account.comparePassword(password);
    if (!isMatch) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Auth login: password mismatch for', normalizedEmail, `(${accountType})`);
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    account.lastLogin = new Date();
    await account.save({ validateBeforeSave: false });

    const token = generateToken(account._id, accountType);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: serializeAccount(account, accountType),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };
