
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


// Add other routes for deleting items, updating lists etc.

module.exports = router;
