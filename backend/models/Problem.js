const mongoose = require('mongoose');

const problemSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    studentId: {
      type: String,
      required: true,
      trim: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    roomNumber: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Electrical', 'Plumbing', 'Carpentry', 'Cleaning', 'Internet/Wi-Fi', 'Security', 'Other'],
      default: 'Electrical',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'emergency'],
      default: 'medium',
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'assigned', 'in-progress', 'resolved', 'closed'],
      default: 'pending',
    },
    assignedTo: {
      type: String,
      default: '',
    },
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    staffRemarks: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Problem = mongoose.model('Problem', problemSchema);

module.exports = Problem;
