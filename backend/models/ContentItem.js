
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubtaskSchema = new Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const ContentItemSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  type: { type: String, enum: ['task', 'note'], required: true },
  completed: { type: Boolean, default: false },
  subtasks: [SubtaskSchema],
  tags: [{ type: String }],
  createdBy: { type: String, required: true }, // Simplified to store user ID string
  createdAt: { type: Date, default: Date.now },
  dueDate: { type: Date },
});

module.exports = ContentItemSchema; // Export schema to be embedded in TaskList
