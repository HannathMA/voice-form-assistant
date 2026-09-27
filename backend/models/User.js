const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    language: {
      type: String,
      enum: ['en', 'ml', 'hi', 'ta', 'te'],
      default: 'en',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
