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
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    program: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: String,
      required: true,
      trim: true,
    },
    session: {
      type: String,
      trim: true,
      default: '2021-2022',
    },
    cgpa: {
      type: String,
      trim: true,
      default: '',
    },
    homeDistrict: {
      type: String,
      trim: true,
      default: '',
    },
    guardianName: {
      type: String,
      required: true,
      trim: true,
    },
    guardianPhone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    document: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'approved', 'rejected', 'allocated', 'cancelled'],
      default: 'pending',
    },
    remarks: {
      type: String,
      default: '',
    },
    assignedRoom: {
      type: String,
      default: '',
    },
    assignedSeat: {
      type: String,
      default: '',
    },
    feeInvoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
    },
    paymentStatus: {
      type: String,
      enum: ['none', 'unpaid', 'paid'],
      default: 'none',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
