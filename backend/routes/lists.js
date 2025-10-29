
const express = require('express');
const router = express.Router();
const TaskList = require('../models/TaskList');

// @route   GET /api/lists
// @desc    Get all task lists
router.get('/', async (req, res) => {
  try {
    const lists = await TaskList.find().sort({ name: 1 });
    res.json(lists);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/lists
// @desc    Create a new task list (folder)
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length === 0) return res.status(400).json({ msg: 'Name is required' });

    // If exists, return existing
    let existing = await TaskList.findOne({ name: name.trim() });
    if (existing) return res.status(200).json(existing);

    const list = new TaskList({ name: name.trim(), items: [] });
    await list.save();
    res.status(201).json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/lists/:listId
// @desc    Delete a task list (folder)
router.delete('/:listId', async (req, res) => {
  try {
    console.log(`Attempting to delete list with ID: ${req.params.listId}`);
    const deletedList = await TaskList.findByIdAndDelete(req.params.listId);
    if (!deletedList) {
      console.log(`List with ID: ${req.params.listId} not found.`);
      return res.status(404).json({ error: 'List not found' });
    }
    res.json({ message: 'List deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete list', details: err.message });
  }
});

// @route   POST /api/lists/:listId/items
// @desc    Add an item to a list
router.post('/:listId/items', async (req, res) => {
  try {
    const list = await TaskList.findById(req.params.listId);
    if (!list) return res.status(404).json({ msg: 'List not found' });

    // Mongoose subdocuments are created directly
    list.items.unshift(req.body);
    await list.save();
    res.json(list.items[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/lists/:listId/items/:itemId
// @desc    Update an item in a list
router.put('/:listId/items/:itemId', async (req, res) => {
    try {
        const list = await TaskList.findById(req.params.listId);
        if (!list) return res.status(404).json({ msg: 'List not found' });

        const item = list.items.id(req.params.itemId);
        if (!item) return res.status(404).json({ msg: 'Item not found' });
        
        // Update fields
        Object.assign(item, req.body);
        
        await list.save();
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/lists/:listId/items/:itemId
// @desc    Delete an item in a list
router.delete('/:listId/items/:itemId', async (req, res) => {
  try {
    const list = await TaskList.findById(req.params.listId);
    if (!list) return res.status(404).json({ msg: 'List not found' });

    list.items.pull({ _id: req.params.itemId });
    
    await list.save();
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', details: err.message });
  }
});

module.exports = router;
