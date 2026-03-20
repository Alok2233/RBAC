const User = require('../models/User');
const Admin = require('../models/Admin');

/**
 * @desc    Get current user profile
 * @route   GET /api/users/me
 * @access  Private (auth only, no approval check — user needs to see their pending status)
 */
const getMe = async (req, res, next) => {
  try {
    if (req.user.accountType === 'admin') {
      const admin = await Admin.findById(req.user._id);
      if (!admin) {
        return res.status(404).json({ success: false, message: 'Admin not found.' });
      }

      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: 'admin',
            status: 'approved',
            createdAt: admin.createdAt,
            lastLogin: admin.lastLogin || null,
            accountType: 'admin',
          },
        },
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          ...user.toObject(),
          id: user._id,
          accountType: 'user',
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users (paginated)
 * @route   GET /api/users
 * @access  Admin only
 */
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const statusFilter = req.query.status;
    const search = req.query.search;

    const query = {};
    if (statusFilter && ['pending', 'approved', 'rejected'].includes(statusFilter)) {
      query.status = statusFilter;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('approvedBy', 'name email'),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all pending users
 * @route   GET /api/users/pending
 * @access  Admin only
 */
const getPendingUsers = async (req, res, next) => {
  try {
    const users = await User.find({ status: 'pending' })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { users, count: users.length },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve a user
 * @route   PATCH /api/users/:id/approve
 * @access  Admin only
 */
const approveUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify admin accounts.',
      });
    }

    if (user.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'User is already approved.',
      });
    }

    user.status = 'approved';
    user.approvedAt = new Date();
    user.approvedBy = req.user._id;
    user.rejectionReason = null;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: `User "${user.name}" has been approved.`,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject a user
 * @route   PATCH /api/users/:id/reject
 * @access  Admin only
 */
const rejectUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify admin accounts.',
      });
    }

    if (user.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'User is already rejected.',
      });
    }

    user.status = 'rejected';
    user.rejectionReason = req.body.reason || 'No reason provided.';
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: `User "${user.name}" has been rejected.`,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get dashboard stats (admin)
 * @route   GET /api/users/stats
 * @access  Admin only
 */
const getStats = async (req, res, next) => {
  try {
    const [total, pending, approved, rejected] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ status: 'pending', role: 'user' }),
      User.countDocuments({ status: 'approved', role: 'user' }),
      User.countDocuments({ status: 'rejected', role: 'user' }),
    ]);

    // Recent registrations last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSignups = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
      role: 'user',
    });

    res.status(200).json({
      success: true,
      data: { total, pending, approved, rejected, recentSignups },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMe, getAllUsers, getPendingUsers, approveUser, rejectUser, getStats };
