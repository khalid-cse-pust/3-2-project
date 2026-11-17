const mongoose = require('mongoose');

const invoiceSchema = mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentId: {
      type: String,
      required: true,
      trim: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        'seat_allocation_fee',
        'monthly_hall_fee',
        'semester_hall_fee',
        'hall_admission_fee',
        'renewal_fee',
        'fine_or_damage',
      ],
      default: 'seat_allocation_fee',
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'BDT',
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['unpaid', 'paid', 'cancelled', 'waived'],
      default: 'unpaid',
    },
    paidAt: {
      type: Date,
    },
    paymentMethod: {
      type: String,
    },
    transactionId: {
      type: String,
    },
    relatedApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
    },
    relatedSeat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seat',
    },
  },
  {
    timestamps: true,
  }
);

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
