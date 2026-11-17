const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Seat = require('../models/Seat');
const Room = require('../models/Room');
const Application = require('../models/Application');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const sslcommerzService = require('../utils/sslcommerzService');

// @desc    Get user invoices (student sees their own, admin/staff sees all)
// @route   GET /api/payments/invoices
// @access  Private
const getInvoices = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (req.query.studentId) {
      query.studentId = req.query.studentId;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    const invoices = await Invoice.find(query).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new invoice manually (Admin only)
// @route   POST /api/payments/invoices
// @access  Private/Admin
const createInvoice = async (req, res) => {
  try {
    const { studentId, category, title, description, amount, dueDate } = req.body;

    const student = await User.findOne({ studentId: studentId.trim() });
    if (!student) {
      return res.status(404).json({ message: 'Student not found with provided ID' });
    }

    const invoiceNumber = `INV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const invoice = await Invoice.create({
      invoiceNumber,
      student: student._id,
      studentId: student.studentId,
      studentName: student.name,
      email: student.email,
      category: category || 'monthly_hall_fee',
      title: title || 'Hall Accommodation Fee',
      description: description || '',
      amount: Number(amount),
      dueDate: dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: 'unpaid',
    });

    await AuditLog.create({
      action: 'INVOICE_CREATED',
      module: 'payment',
      performedBy: req.user._id,
      performerRole: req.user.role,
      targetEntity: 'Invoice',
      targetId: invoice._id.toString(),
      details: { invoiceNumber, studentId, amount },
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Initialize SSLCommerz Payment Session
// @route   POST /api/payments/initiate/:invoiceId
// @access  Private
const initiatePayment = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({ message: 'Invoice has already been paid' });
    }

    // Check student ownership if role is student
    if (req.user.role === 'student' && invoice.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to pay this invoice' });
    }

    // Generate unique transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    // Create payment attempt record
    const payment = await Payment.create({
      transactionId,
      invoice: invoice._id,
      student: invoice.student,
      studentId: invoice.studentId,
      studentName: invoice.studentName,
      amount: invoice.amount,
      currency: invoice.currency || 'BDT',
      status: 'pending',
      gateway: 'SSLCommerz',
    });

    // Request session initialization from SSLCommerz service
    const session = await sslcommerzService.initPayment({
      transactionId,
      amount: invoice.amount,
      customerName: invoice.studentName,
      customerEmail: invoice.email,
      customerPhone: req.user.phone || '01700000000',
      invoiceTitle: invoice.title,
    });

    res.json({
      success: true,
      transactionId,
      gatewayUrl: session.gatewayUrl,
      isMock: session.isMock || false,
    });
  } catch (error) {
    console.error('Error in initiatePayment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Helper: Handle successful payment confirmation
async function handleSuccessfulPayment(transactionId, gatewayData = {}, isSandboxSimulated = false) {
  const payment = await Payment.findOne({ transactionId });
  if (!payment) return null;

  if (payment.status === 'success') {
    return payment; // Idempotent return
  }

  payment.status = 'success';
  payment.paidAt = new Date();
  payment.gatewayResponse = gatewayData;
  payment.cardType = gatewayData.card_type || (isSandboxSimulated ? 'Sandbox Test Card' : 'VISA/Mastercard/bKash');
  payment.bankTranId = gatewayData.bank_tran_id || `BANK_${Date.now()}`;
  payment.validationId = gatewayData.val_id || `VAL_${Date.now()}`;
  await payment.save();

  // Update Invoice
  const invoice = await Invoice.findById(payment.invoice);
  if (invoice) {
    invoice.status = 'paid';
    invoice.paidAt = new Date();
    invoice.paymentMethod = payment.cardType;
    invoice.transactionId = payment.transactionId;
    await invoice.save();

    // If related to an application, update application status & complete seat allocation
    if (invoice.relatedApplication) {
      const app = await Application.findById(invoice.relatedApplication);
      if (app) {
        app.paymentStatus = 'paid';
        app.status = 'allocated';
        await app.save();

        // Ensure user is marked residential and has roomNumber
        await User.findByIdAndUpdate(app.user, {
          isResidential: true,
          roomNumber: app.assignedRoom,
          seatNumber: app.assignedSeat,
          approvalStatus: 'approved',
          isApproved: true,
        });

        // Ensure seat status is confirmed 'occupied'
        if (app.assignedSeat) {
          await Seat.findOneAndUpdate(
            { seatNumber: app.assignedSeat },
            {
              status: 'occupied',
              allocatedStudent: app.user,
              studentId: app.studentId,
              allocatedAt: new Date(),
            }
          );
        }
      }
    }
  }

  // Audit log
  await AuditLog.create({
    action: 'PAYMENT_VERIFIED_SUCCESS',
    module: 'payment',
    performedBy: payment.student,
    performerRole: 'student',
    targetEntity: 'Payment',
    targetId: payment._id.toString(),
    details: {
      transactionId,
      amount: payment.amount,
      isSandboxSimulated,
    },
  });

  return payment;
}

// @desc    SSLCommerz Success Callback (POST or GET)
// @route   POST /api/payments/sslcommerz/success
// @access  Public
const sslcommerzSuccess = async (req, res) => {
  try {
    const data = req.method === 'POST' ? req.body : req.query;
    const { tran_id, val_id, amount } = data;

    if (!tran_id) {
      return res.redirect(`${sslcommerzService.frontendUrl}/#payment-result?status=failed&message=Missing+transaction+id`);
    }

    const payment = await Payment.findOne({ transactionId: tran_id });
    if (!payment) {
      return res.redirect(`${sslcommerzService.frontendUrl}/#payment-result?status=failed&message=Payment+record+not+found`);
    }

    // Authoritative verification via SSLCommerz validator API if val_id is present
    if (val_id) {
      const validation = await sslcommerzService.validateTransaction({
        valId: val_id,
        transactionId: tran_id,
        amount: payment.amount,
      });

      if (!validation.isValid) {
        payment.status = 'failed';
        payment.gatewayResponse = validation;
        await payment.save();
        return res.redirect(`${sslcommerzService.frontendUrl}/#payment-result?status=failed&message=Authoritative+validation+failed`);
      }

      await handleSuccessfulPayment(tran_id, validation.data, false);
    } else {
      // Sandbox fallback validation
      await handleSuccessfulPayment(tran_id, data, true);
    }

    return res.redirect(`${sslcommerzService.frontendUrl}/#payment-result?status=success&tran_id=${tran_id}`);
  } catch (error) {
    console.error('SSLCommerz success handler error:', error);
    return res.redirect(`${sslcommerzService.frontendUrl}/#payment-result?status=error&message=${encodeURIComponent(error.message)}`);
  }
};

// @desc    SSLCommerz Fail Callback
// @route   POST /api/payments/sslcommerz/fail
// @access  Public
const sslcommerzFail = async (req, res) => {
  const data = req.method === 'POST' ? req.body : req.query;
  const { tran_id } = data;

  if (tran_id) {
    await Payment.findOneAndUpdate(
      { transactionId: tran_id },
      { status: 'failed', gatewayResponse: data }
    );
  }

  return res.redirect(`${sslcommerzService.frontendUrl}/#payment-result?status=failed&tran_id=${tran_id || ''}`);
};

// @desc    SSLCommerz Cancel Callback
// @route   POST /api/payments/sslcommerz/cancel
// @access  Public
const sslcommerzCancel = async (req, res) => {
  const data = req.method === 'POST' ? req.body : req.query;
  const { tran_id } = data;

  if (tran_id) {
    await Payment.findOneAndUpdate(
      { transactionId: tran_id },
      { status: 'cancelled', gatewayResponse: data }
    );
  }

  return res.redirect(`${sslcommerzService.frontendUrl}/#payment-result?status=cancelled&tran_id=${tran_id || ''}`);
};

// @desc    SSLCommerz IPN (Instant Payment Notification)
// @route   POST /api/payments/sslcommerz/ipn
// @access  Public
const sslcommerzIpn = async (req, res) => {
  try {
    const data = req.body;
    const { tran_id, val_id, status } = data;

    if (tran_id && status === 'VALID') {
      const payment = await Payment.findOne({ transactionId: tran_id });
      if (payment && payment.status !== 'success') {
        const validation = await sslcommerzService.validateTransaction({
          valId: val_id,
          transactionId: tran_id,
          amount: payment.amount,
        });

        if (validation.isValid) {
          await handleSuccessfulPayment(tran_id, validation.data, false);
        }
      }
    }

    res.status(200).send('IPN Handled');
  } catch (error) {
    console.error('IPN processing error:', error);
    res.status(500).send('IPN Error');
  }
};

// @desc    Execute verified Sandbox Simulation test payment
// @route   POST /api/payments/sandbox-simulate
// @access  Private
const sandboxSimulatePayment = async (req, res) => {
  try {
    const { transactionId } = req.body;
    if (!transactionId) {
      return res.status(400).json({ message: 'Transaction ID is required' });
    }

    const payment = await Payment.findOne({ transactionId });
    if (!payment) {
      return res.status(404).json({ message: 'Transaction record not found' });
    }

    if (payment.status === 'success') {
      return res.json({ success: true, message: 'Already marked as paid', payment });
    }

    const updatedPayment = await handleSuccessfulPayment(
      transactionId,
      {
        card_type: 'SSLCommerz Sandbox Test Card (bKash/Nagad/DBBL)',
        bank_tran_id: `SIM_TEST_${Date.now()}`,
        val_id: `SIM_VAL_${Date.now()}`,
        status: 'VALID',
        simulated: true,
      },
      true
    );

    res.json({
      success: true,
      message: 'Sandbox payment verified and processed successfully',
      payment: updatedPayment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all payments history (Admin)
// @route   GET /api/payments/history
// @access  Private
const getPaymentsHistory = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (req.query.status) {
      query.status = req.query.status;
    }

    const payments = await Payment.find(query)
      .populate('invoice')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getInvoices,
  createInvoice,
  initiatePayment,
  sslcommerzSuccess,
  sslcommerzFail,
  sslcommerzCancel,
  sslcommerzIpn,
  sandboxSimulatePayment,
  getPaymentsHistory,
};
