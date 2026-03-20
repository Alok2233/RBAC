const Task = require('../models/Task');

const createTask = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      createdBy: req.user._id,
    });

    const populatedTask = await Task.findById(task._id).populate('createdBy', 'name email status');

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: { task: populatedTask },
    });
  } catch (error) {
    next(error);
  }
};

const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email status');

    res.status(200).json({
      success: true,
      data: { tasks, count: tasks.length },
    });
  } catch (error) {
    next(error);
  }
};

const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email status');

    res.status(200).json({
      success: true,
      data: { tasks, count: tasks.length },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTask, getMyTasks, getAllTasks };
