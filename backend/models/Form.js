const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'select', 'checkbox', 'textarea'],
      default: 'text',
    },
    options: [String],        // for select fields
    required: { type: Boolean, default: false },
    placeholder: String,
    box_2d: [Number],         // [ymin, xmin, ymax, xmax] normalized on 0-1000 scale
  },
  { _id: false }
);

const formSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    formTitle: { type: String, default: 'Untitled Form' },
    imagePath: { type: String },      // relative path under /uploads
    fields: [fieldSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Form', formSchema);
