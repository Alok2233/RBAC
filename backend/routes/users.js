const express = require('express');
const router = express.Router();
const {
  getMe,
  getAllUsers,
  getPendingUsers,
  approveUser,
  rejectUser,
  getStats,
} = require('../controllers/userController');
const { authMiddleware, authorizeRoles, checkApproval } = require('../middleware/auth');

// ─── Current user profile ────────────────────────────────────────────────────
// NOTE: No checkApproval here — users need to see their own pending/rejected status
router.get('/me', authMiddleware, getMe);

// ─── Admin-only routes ────────────────────────────────────────────────────────
router.get(
  '/stats',
  authMiddleware,
  authorizeRoles('admin'),
  getStats
);

router.get(
  '/pending',
  authMiddleware,
  authorizeRoles('admin'),
  getPendingUsers
);

router.get(
  '/',
  authMiddleware,
  authorizeRoles('admin'),
  getAllUsers
);

router.patch(
  '/:id/approve',
  authMiddleware,
  authorizeRoles('admin'),
  approveUser
);

router.patch(
  '/:id/reject',
  authMiddleware,
  authorizeRoles('admin'),
  rejectUser
);

module.exports = router;
