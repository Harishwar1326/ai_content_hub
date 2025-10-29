const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const STORAGE_ROOT = path.join(__dirname, '..', 'storage');

// Ensure storage root exists
if (!fs.existsSync(STORAGE_ROOT)) {
  fs.mkdirSync(STORAGE_ROOT, { recursive: true });
}

// GET /api/folders - list folders inside the storage root
router.get('/', (req, res) => {
  try {
    const entries = fs.readdirSync(STORAGE_ROOT, { withFileTypes: true });
    const folders = entries.filter(e => e.isDirectory()).map(d => d.name);
    res.json({ folders });
  } catch (err) {
    console.error('Error listing folders', err);
    res.status(500).json({ error: 'Unable to list folders' });
  }
});

module.exports = router;
