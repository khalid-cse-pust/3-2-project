const mongoose = require('mongoose');

const applicationSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    studentId: {
      type: String,
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    program: {
      type: String,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    guardianName: {
      type: String,
      required: true,
    },
    guardianPhone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    document: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    remarks: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
