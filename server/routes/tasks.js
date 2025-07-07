const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// GET all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST new task
router.post('/', async (req, res) => {
  const { title } = req.body;
  try {
    const newTask = new Task({ title, completed: false });
    const savedTask = await newTask.save();

    const io = req.app.get('io'); // ✅ Get io from app
    io.emit('taskAdded', savedTask); // ✅ Broadcast

    res.status(201).json(savedTask);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT update task
router.put('/:id', async (req, res) => {
  const { completed } = req.body;
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { completed },
      { new: true }
    );

    const io = req.app.get('io');
    io.emit('taskUpdated', updatedTask); // ✅ Broadcast

    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE task
router.delete('/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);

    const io = req.app.get('io');
    io.emit('taskDeleted', req.params.id); // ✅ Broadcast

    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;
