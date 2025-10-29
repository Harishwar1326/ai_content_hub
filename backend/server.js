
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
// Ensure we load the .env located in the backend folder regardless of cwd
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = 5001; // Fixed port to avoid conflicts

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route for testing
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Database Connection
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_content_hub';
mongoose
  .connect(mongoUri)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });


// API Routes
app.use('/api/lists', require('./routes/lists'));
app.use('/api/ai', require('./routes/ai'));


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
