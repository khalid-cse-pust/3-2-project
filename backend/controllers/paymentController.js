const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Seat = require('../models/Seat');
const Room = require('../models/Room');
const Application = require('../models/Application');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// @desc    Get user invoices (student sees their own, admin/staff sees all)
// @route   GET /api/payments/invoices
// @access  Private
const getInvoices = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      const orClauses = [
        { student: req.user._id },
        { user: req.user._id },
      ];
      if (req.user.studentId) {
        orClauses.push({ studentId: req.user.studentId });
      }
      query.$or = orClauses;
    } else if (req.query.studentId) {
      query.studentId = req.query.studentId.trim();
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    const invoices = await Invoice.find(query)
      .populate('payment')
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new invoice manually (Admin only)
// @route   POST /api/payments/invoices
// @access  Private/Admin
const createInvoice = async (req, res) => {
  try {
    const { studentId, category, title, description, amount, dueDate } = req.body;

    if (!studentId || !amount) {
      return res.status(400).json({ message: 'Student ID and amount are required' });
    }

    const student = await User.findOne({ studentId: studentId.trim() });
    if (!student) {
      return res.status(404).json({ message: `Student not found with ID: ${studentId}` });
    }

    const invoiceNumber = `INV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const invoice = await Invoice.create({
      invoiceNumber,
      student: student._id,
      user: student._id,
      studentId: student.studentId,
      studentName: student.name,
      email: student.email,
      category: category || 'monthly_hall_fee',
      title: title || 'Hall Accommodation Fee',
      description: description || '',
      amount: Number(amount),
      dueDate: dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: 'unpaid',
      isSandbox: true,
    });

    await AuditLog.create({
      action: 'INVOICE_CREATED',
      module: 'payment',
      performedBy: req.user._id,
      performerRole: req.user.role,
      targetEntity: 'Invoice',
      targetId: invoice._id.toString(),
      details: { invoiceNumber, studentId, amount: Number(amount) },
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Initiate Dummy Payment Session
// @route   POST /api/payments/initiate/:invoiceId
// @access  Private
const initiatePayment = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // 1. DUPLICATE PAYMENT PREVENTION
    if (invoice.status === 'paid') {
      return res.status(400).json({
        message: `Invoice ${invoice.invoiceNumber} has already been paid. Duplicate payment is not allowed.`,
      });
    }

    // Check if a verified successful payment already exists for this invoice
    const existingSuccess = await Payment.findOne({
      invoice: invoice._id,
      status: 'success',
    });
    if (existingSuccess) {
      invoice.status = 'paid';
      invoice.transactionId = existingSuccess.transactionId;
      invoice.payment = existingSuccess._id;
      await invoice.save();
      return res.status(400).json({
        message: 'A confirmed payment record already exists for this invoice.',
      });
    }

    // Student authorization check
    const invoiceStudentId = (invoice.student || invoice.user)?.toString();
    if (
      req.user.role === 'student' &&
      invoiceStudentId &&
      invoiceStudentId !== req.user._id.toString() &&
      invoice.studentId !== req.user.studentId
    ) {
      return res.status(403).json({ message: 'You are not authorized to pay this invoice' });
    }

    // Generate unique sandbox transaction ID
    const transactionId = `TXN-DEMO-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create pending Payment record in MongoDB
    const payment = await Payment.create({
      transactionId,
      invoice: invoice._id,
      user: invoice.student || req.user._id,
      student: invoice.student || req.user._id,
      studentId: invoice.studentId,
      studentName: invoice.studentName,
      amount: invoice.amount,
      currency: invoice.currency || 'BDT',
      paymentMethod: 'bKash', // default initial
      status: 'pending',
      gateway: 'Institutional Sandbox Simulator',
      isSandbox: true,
      simulationNote: 'Pending simulated sandbox checkout',
    });

    res.json({
      success: true,
      transactionId: payment.transactionId,
      amount: invoice.amount,
      currency: invoice.currency || 'BDT',
      invoiceNumber: invoice.invoiceNumber,
      invoiceTitle: invoice.title,
      invoice: invoice,
      isSandbox: true,
      isMock: true,
      gatewayUrl: '#payment-sandbox',
      message: 'Demo sandbox payment initiated successfully',
    });
  } catch (error) {
    console.error('Error initiating payment:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Process simulated sandbox payment (Success, Fail, or Cancel)
// @route   POST /api/payments/simulate or /api/payments/sandbox-simulate
// @access  Private
const simulatePayment = async (req, res) => {
  try {
    const {
      transactionId,
      paymentMethod = 'bKash',
      cardType,
      outcome = 'success',
      simulationOutcome,
      failureReason,
    } = req.body;

    const chosenOutcome = (simulationOutcome || outcome || 'success').toLowerCase();

    // Normalize payment method to enum values: ['bKash', 'Nagad', 'Rocket', 'Card', 'SSLCommerz', 'Other']
    let normalizedMethod = 'bKash';
    const rawMethod = (paymentMethod || cardType || 'bKash').toString().toLowerCase();
    if (rawMethod.includes('bkash')) normalizedMethod = 'bKash';
    else if (rawMethod.includes('nagad')) normalizedMethod = 'Nagad';
    else if (rawMethod.includes('rocket')) normalizedMethod = 'Rocket';
    else if (rawMethod.includes('card') || rawMethod.includes('visa') || rawMethod.includes('master')) normalizedMethod = 'Card';
    else if (rawMethod.includes('sslcommerz')) normalizedMethod = 'SSLCommerz';
    else normalizedMethod = 'Other';

    if (!transactionId) {
      return res.status(400).json({ message: 'Transaction ID is required' });
    }

    const payment = await Payment.findOne({ transactionId });
    if (!payment) {
      return res.status(404).json({ message: 'Payment transaction record not found' });
    }

    const invoice = await Invoice.findById(payment.invoice);
    if (!invoice) {
      return res.status(404).json({ message: 'Associated invoice record not found' });
    }

    // Duplicate check: if already marked as paid
    if (payment.status === 'success' || invoice.status === 'paid') {
      return res.json({
        success: true,
        alreadyPaid: true,
        message: 'This fee is already recorded as Paid in MongoDB.',
        payment,
        invoice,
      });
    }

    // 1. OUTCOME: SUCCESS
    if (chosenOutcome === 'success') {
      const now = new Date();
      const receiptNumber = `REC-DEMO-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

      // Update payment record in MongoDB
      payment.status = 'success';
      payment.paymentMethod = normalizedMethod;
      payment.cardType = cardType || normalizedMethod;
      payment.paymentDate = now;
      payment.paidAt = now;
      payment.receiptNumber = receiptNumber;
      payment.simulationOutcome = 'success';
      payment.simulationNote = `Verified simulated transaction via ${normalizedMethod} in MongoDB Sandbox`;
      payment.bankTranId = `SIM_${normalizedMethod.toUpperCase()}_${Date.now()}`;
      payment.validationId = `VAL_DEMO_${Date.now()}`;
      await payment.save();

      // Update Invoice status to Paid
      invoice.status = 'paid';
      invoice.paidAt = now;
      invoice.paymentMethod = normalizedMethod;
      invoice.transactionId = payment.transactionId;
      invoice.payment = payment._id;
      await invoice.save();

      // If invoice relates to a residency application, complete seat allocation workflow
      if (invoice.relatedApplication) {
        const app = await Application.findById(invoice.relatedApplication);
        if (app) {
          app.paymentStatus = 'paid';
          app.status = 'allocated';
          await app.save();

          // Confirm seat occupancy
          let allocatedSeatDoc = null;
          if (app.assignedSeat) {
            allocatedSeatDoc = await Seat.findOneAndUpdate(
              { seatNumber: new RegExp('^' + app.assignedSeat.trim() + '$', 'i') },
              {
                status: 'occupied',
                allocatedStudent: app.user,
                studentId: app.studentId,
                allocatedAt: now,
                reservationExpiry: null,
              },
              { new: true }
            );

            // Update room occupied count
            if (app.assignedRoom) {
              const totalOccupied = await Seat.countDocuments({
                roomNumber: app.assignedRoom,
                status: 'occupied',
              });
              await Room.findOneAndUpdate(
                { roomNumber: app.assignedRoom },
                { occupiedSeatsCount: totalOccupied }
              );
            }
          }

          // Mark user as residential and set room & seat
          await User.findByIdAndUpdate(app.user, {
            isResidential: true,
            roomNumber: app.assignedRoom,
            seatNumber: app.assignedSeat,
            allocatedSeat: allocatedSeatDoc ? allocatedSeatDoc._id : undefined,
            approvalStatus: 'approved',
            isApproved: true,
          });
        }
      }

      // Record audit log
      await AuditLog.create({
        action: 'PAYMENT_SIMULATION_SUCCESS',
        module: 'payment',
        performedBy: req.user._id,
        performerRole: req.user.role,
        targetEntity: 'Payment',
        targetId: payment._id.toString(),
        details: {
          transactionId: payment.transactionId,
          amount: payment.amount,
          paymentMethod: normalizedMethod,
          invoiceNumber: invoice.invoiceNumber,
          isSandbox: true,
        },
      });

      return res.json({
        success: true,
        message: `Simulated payment of ৳${payment.amount} via ${normalizedMethod} confirmed successfully!`,
        payment,
        invoice,
      });
    }

    // 2. OUTCOME: FAILED
    if (chosenOutcome === 'failed') {
      payment.status = 'failed';
      payment.paymentMethod = normalizedMethod;
      payment.simulationOutcome = 'failed';
      payment.failureReason =
        failureReason || `Simulated transaction failure: Insufficient funds or declined by mock ${normalizedMethod}`;
      payment.simulationNote = 'Simulated failed transaction in sandbox. Fee remains unpaid.';
      await payment.save();

      // Fee remains unpaid
      invoice.status = 'unpaid';
      await invoice.save();

      await AuditLog.create({
        action: 'PAYMENT_SIMULATION_FAILED',
        module: 'payment',
        performedBy: req.user._id,
        performerRole: req.user.role,
        targetEntity: 'Payment',
        targetId: payment._id.toString(),
        details: {
          transactionId: payment.transactionId,
          amount: payment.amount,
          paymentMethod: normalizedMethod,
          reason: payment.failureReason,
        },
      });

      return res.json({
        success: false,
        simulated: true,
        message: 'Simulated payment failed as requested. The fee remains unpaid.',
        payment,
        invoice,
      });
    }

    // 3. OUTCOME: CANCELLED
    if (chosenOutcome === 'cancelled') {
      payment.status = 'cancelled';
      payment.paymentMethod = normalizedMethod;
      payment.simulationOutcome = 'cancelled';
      payment.simulationNote = 'Simulated transaction cancelled by user in checkout interface.';
      await payment.save();

      // Fee remains unpaid
      invoice.status = 'unpaid';
      await invoice.save();

      await AuditLog.create({
        action: 'PAYMENT_SIMULATION_CANCELLED',
        module: 'payment',
        performedBy: req.user._id,
        performerRole: req.user.role,
        targetEntity: 'Payment',
        targetId: payment._id.toString(),
        details: {
          transactionId: payment.transactionId,
          amount: payment.amount,
          paymentMethod: normalizedMethod,
        },
      });

      return res.json({
        success: false,
        simulated: true,
        message: 'Simulated payment session was cancelled. The fee remains unpaid.',
        payment,
        invoice,
      });
    }

    return res.status(400).json({ message: `Unknown outcome: ${chosenOutcome}` });
  } catch (error) {
    console.error('Error in simulatePayment:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all payment history (student sees theirs, admin sees all)
// @route   GET /api/payments/history
// @access  Private
const getPaymentsHistory = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      const orClauses = [
        { student: req.user._id },
        { user: req.user._id },
      ];
      if (req.user.studentId) {
        orClauses.push({ studentId: req.user.studentId });
      }
      query.$or = orClauses;
    } else {
      if (req.query.studentId) query.studentId = req.query.studentId.trim();
      if (req.query.status) query.status = req.query.status;
      if (req.query.paymentMethod) query.paymentMethod = req.query.paymentMethod;
    }

    const payments = await Payment.find(query)
      .populate('invoice')
      .populate('user', 'name email studentId department phone roomNumber')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.error('Error in getPaymentsHistory:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get complete receipt details for a transaction
// @route   GET /api/payments/receipt/:transactionId
// @access  Private
const getPaymentReceipt = async (req, res) => {
  try {
    const payment = await Payment.findOne({ transactionId: req.params.transactionId })
      .populate('invoice')
      .populate('user', 'name email studentId department roomNumber seatNumber phone');

    if (!payment) {
      return res.status(404).json({ message: 'Receipt not found for this transaction ID' });
    }

    // Student authorization check
    if (
      req.user.role === 'student' &&
      payment.student?.toString() !== req.user._id.toString() &&
      payment.user?._id?.toString() !== req.user._id.toString() &&
      payment.studentId !== req.user.studentId
    ) {
      return res.status(403).json({ message: 'Not authorized to view this receipt' });
    }

    res.json({
      institution: 'Pabna University of Science and Technology (PUST)',
      hall: 'Shadhinota Hall',
      title: 'Official Fee Payment Receipt',
      isDemoReceipt: true,
      watermark: 'DEMO PAYMENT RECEIPT - SANDBOX TEST ONLY',
      receiptNumber: payment.receiptNumber || `REC-${payment.transactionId}`,
      transactionId: payment.transactionId,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      amount: payment.amount,
      currency: payment.currency || 'BDT',
      paymentDate: payment.paymentDate || payment.paidAt || payment.createdAt,
      student: {
        name: payment.studentName || payment.user?.name,
        studentId: payment.studentId || payment.user?.studentId,
        department: payment.user?.department || 'N/A',
        roomNumber: payment.user?.roomNumber || 'N/A',
        seatNumber: payment.user?.seatNumber || 'N/A',
        email: payment.user?.email,
      },
      invoice: payment.invoice,
    });
  } catch (error) {
    console.error('Error getting receipt:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Waive Invoice (Admin only)
// @route   PUT /api/payments/invoices/:id/waive
// @access  Private/Admin
const waiveInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    invoice.status = 'waived';
    await invoice.save();

    await AuditLog.create({
      action: 'INVOICE_WAIVED',
      module: 'payment',
      performedBy: req.user._id,
      performerRole: req.user.role,
      targetEntity: 'Invoice',
      targetId: invoice._id.toString(),
      details: { invoiceNumber: invoice.invoiceNumber },
    });

    res.json({ success: true, message: 'Invoice marked as waived', invoice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel Invoice (Admin only)
// @route   PUT /api/payments/invoices/:id/cancel
// @access  Private/Admin
const cancelInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({ message: 'Paid invoices cannot be cancelled' });
    }

    invoice.status = 'cancelled';
    await invoice.save();

    await AuditLog.create({
      action: 'INVOICE_CANCELLED',
      module: 'payment',
      performedBy: req.user._id,
      performerRole: req.user.role,
      targetEntity: 'Invoice',
      targetId: invoice._id.toString(),
      details: { invoiceNumber: invoice.invoiceNumber },
    });

    res.json({ success: true, message: 'Invoice cancelled', invoice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Safe fallback stubs for legacy callback endpoints
const sslcommerzSuccess = (req, res) => {
  res.json({ success: true, message: 'Institutional sandbox mode active. Real SSLCommerz gateway disabled.' });
};
const sslcommerzFail = (req, res) => {
  res.json({ success: false, message: 'Institutional sandbox mode active.' });
};
const sslcommerzCancel = (req, res) => {
  res.json({ success: false, message: 'Institutional sandbox mode active.' });
};
const sslcommerzIpn = (req, res) => {
  res.status(200).send('IPN Handled (Sandbox Mode)');
};

module.exports = {
  getInvoices,
  createInvoice,
  initiatePayment,
  simulatePayment,
  sandboxSimulatePayment: simulatePayment,
  getPaymentsHistory,
  getPaymentReceipt,
  waiveInvoice,
  cancelInvoice,
  sslcommerzSuccess,
  sslcommerzFail,
  sslcommerzCancel,
  sslcommerzIpn,
};
