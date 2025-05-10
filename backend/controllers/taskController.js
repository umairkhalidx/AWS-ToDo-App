const { Task, User } = require('../models');

// @desc    Get all tasks for a user
// @route   GET /api/tasks
const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    const { text } = req.body;
    const task = await Task.create({ text, userId: req.user.id });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const task = await Task.findOne({ where: { id, userId: req.user.id } });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.text = text;
    await task.save();

    res.json(task);
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({ where: { id, userId: req.user.id } });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.destroy();
    res.json({ message: 'Task removed' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get task PDF
// @route   GET /api/task-pdf
const getTaskPdf = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.json({ pdfUrl: user.pdfUrl || null });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskPdf
};