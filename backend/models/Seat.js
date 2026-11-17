const mongoose = require('mongoose');

const seatSchema = mongoose.Schema(
  {
    seatNumber: {
      type: String, // e.g., 'B-224-A', 'B-224-B'
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    roomNumber: {
      type: String,
      required: true,
      trim: true,
    },
    bedLabel: {
      type: String, // 'A', 'B', 'C', 'D'
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'occupied', 'under_maintenance', 'vacated'],
      default: 'available',
    },
    allocatedStudent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    studentId: {
      type: String,
      default: null,
      trim: true,
    },
    allocatedAt: {
      type: Date,
      default: null,
    },
    allocationExpiry: {
      type: Date,
      default: null,
    },
    reservationExpiry: {
      type: Date,
      default: null,
    },
    allocatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

seatSchema.index({ room: 1, bedLabel: 1 }, { unique: true });

const Seat = mongoose.model('Seat', seatSchema);

module.exports = Seat;
