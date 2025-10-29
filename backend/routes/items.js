const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');


const TaskList = require('../models/TaskList');
const router = express.Router();

const STORAGE_ROOT = path.join(__dirname, '..', 'storage');
const TEMP_DIR = path.join(STORAGE_ROOT, 'temp');

// Ensure storage root and temp exist
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Use multer to put uploads into a temp dir, we'll move them after we know the folder
const upload = multer({ dest: TEMP_DIR });

// POST /api/items - accept form-data with fields and files
router.post('/', upload.array('files'), async (req, res) => {
  try {
    const { title, description = '', type = 'Note', tags = '', folder = '', subtasks = [], createdBy = 'system', dueDate } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Resolve target folder (inside storage root). If empty, use root of storage
    const targetFolderName = folder && folder.trim().length > 0 ? folder : 'General';
    const targetFolder = path.join(STORAGE_ROOT, targetFolderName);

    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    // Move uploaded files from temp into target folder and collect file paths
    const fileInfos = [];
    if (req.files && Array.isArray(req.files)) {
      for (const f of req.files) {
        const originalName = f.originalname || f.filename;
        const destPath = path.join(targetFolder, originalName);
        // If file exists, add a suffix to avoid overwriting
        let finalDest = destPath;
        if (fs.existsSync(finalDest)) {
          const parsed = path.parse(originalName);
          const uniqueName = `${parsed.name}-${Date.now()}${parsed.ext}`;
          finalDest = path.join(targetFolder, uniqueName);
        }
        fs.renameSync(f.path, finalDest);
        fileInfos.push(path.relative(STORAGE_ROOT, finalDest).replace(/\\/g, '/'));
      }
    }

    const tagsArray = tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    // Find or create the TaskList (folder)
    let list = await TaskList.findOne({ name: targetFolderName });
    if (!list) {
      list = new TaskList({ name: targetFolderName, items: [] });
    }

    // Prepare item for MongoDB
    const item = {
      title: title.trim(),
      description: description.trim(),
      type: type.toLowerCase() === 'task' ? 'task' : 'note',
      tags: tagsArray,
      files: fileInfos,
      folder: targetFolderName,
      createdBy,
      createdAt: new Date(),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      subtasks: Array.isArray(subtasks) ? subtasks : [],
    };

    list.items.unshift(item);
    await list.save();

    res.json({ ok: true, item });
  } catch (err) {
    console.error('Error saving item', err);
    res.status(500).json({ error: 'Failed to save item' });
  }
});

module.exports = router;
