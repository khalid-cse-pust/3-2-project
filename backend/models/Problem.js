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
    },
    studentName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    roomNumber: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
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
      enum: ['pending', 'assigned', 'in-progress', 'resolved'],
      default: 'pending',
    },
    assignedTo: {
      type: String,
    },
    staffRemarks: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Problem = mongoose.model('Problem', problemSchema);

module.exports = Problem;
