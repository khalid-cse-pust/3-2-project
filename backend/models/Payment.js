const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
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
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'BDT',
    },
    paymentMethod: {
      type: String,
      enum: ['bKash', 'Nagad', 'Rocket', 'Card', 'SSLCommerz', 'Other'],
      default: 'bKash',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'cancelled'],
      default: 'pending',
      required: true,
    },
    paymentDate: {
      type: Date,
    },
    paidAt: {
      type: Date,
    },
    receiptNumber: {
      type: String,
      trim: true,
    },
    isSandbox: {
      type: Boolean,
      default: true,
    },
    gateway: {
      type: String,
      default: 'Institutional Sandbox Simulator',
    },
    simulationOutcome: {
      type: String,
      enum: ['success', 'failed', 'cancelled'],
    },
    simulationNote: {
      type: String,
      default: 'Simulated Sandbox Transaction',
    },
    failureReason: {
      type: String,
    },
    // Backwards compatibility helper fields
    cardType: {
      type: String,
    },
    bankTranId: {
      type: String,
    },
    validationId: {
      type: String,
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookup and duplicate prevention
paymentSchema.index({ invoice: 1, status: 1 });
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ studentId: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
