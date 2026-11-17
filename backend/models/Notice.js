const mongoose = require('mongoose');

const noticeSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['general', 'seat_allocation', 'dining_hall', 'maintenance', 'discipline', 'emergency'],
      default: 'general',
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'urgent'],
      default: 'normal',
    },
    targetAudience: {
      type: String,
      enum: ['all', 'students', 'staff'],
      default: 'all',
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    attachment: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Notice = mongoose.model('Notice', noticeSchema);

module.exports = Notice;
