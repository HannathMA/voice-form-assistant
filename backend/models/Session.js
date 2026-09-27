const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Form',
      required: true,
    },
    answers: {
      type: Map,
      of: String,
      default: {},
    },
    currentField: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['in_progress', 'completed'],
      default: 'in_progress',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);
