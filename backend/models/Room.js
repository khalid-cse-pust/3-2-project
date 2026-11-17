const mongoose = require('mongoose');

const roomSchema = mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    block: {
      type: String,
      required: true,
      enum: ['Block A', 'Block B', 'Block C', 'Main Building'],
      default: 'Block B',
    },
    floor: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    capacity: {
      type: Number,
      required: true,
      default: 4,
      min: 1,
      max: 8,
    },
    roomType: {
      type: String,
      enum: ['standard', 'attached_bath', 'accessible'],
      default: 'standard',
    },
    status: {
      type: String,
      enum: ['available', 'full', 'under_maintenance', 'reserved'],
      default: 'available',
    },
    maintenanceNotes: {
      type: String,
      default: '',
    },
    occupiedSeatsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
