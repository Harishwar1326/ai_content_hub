
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ContentItemSchema = require('./ContentItem');

const TaskListSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  items: [ContentItemSchema],
  // In a real app, you'd link this to a User collection
  // ownerId: { type: Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('TaskList', TaskListSchema);
