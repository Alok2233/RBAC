const express = require('express');
const router = express.Router();
const { createTask, getMyTasks, getAllTasks } = require('../controllers/taskController');
const { authMiddleware, authorizeRoles, checkApproval } = require('../middleware/auth');
const { validateTask } = require('../middleware/validate');

router.post('/', authMiddleware, authorizeRoles('user'), checkApproval, validateTask, createTask);
router.get('/my', authMiddleware, authorizeRoles('user'), checkApproval, getMyTasks);
router.get('/', authMiddleware, authorizeRoles('admin'), getAllTasks);

module.exports = router;
