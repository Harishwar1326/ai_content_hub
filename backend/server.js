
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection (optional)
const mongoUri = process.env.MONGO_URI;
if (mongoUri) {
  mongoose
    .connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log('MongoDB connected successfully.'))
    .catch((err) => console.error('MongoDB connection error:', err));
} else {
  console.warn('MONGO_URI not set. Backend will run without MongoDB.');
}


// API Routes
app.use('/api/lists', require('./routes/lists'));
app.use('/api/ai', require('./routes/ai'));


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
