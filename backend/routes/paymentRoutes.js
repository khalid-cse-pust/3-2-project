const express = require('express');
const router = express.Router();
const {
  getInvoices,
  createInvoice,
  initiatePayment,
  simulatePayment,
  sandboxSimulatePayment,
  getPaymentsHistory,
  getPaymentReceipt,
  waiveInvoice,
  cancelInvoice,
  sslcommerzSuccess,
  sslcommerzFail,
  sslcommerzCancel,
  sslcommerzIpn,
} = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

// Invoices
router.route('/invoices').get(protect, getInvoices).post(protect, admin, createInvoice);
router.put('/invoices/:id/waive', protect, admin, waiveInvoice);
router.put('/invoices/:id/cancel', protect, admin, cancelInvoice);

// Payment Initiation & Simulation (Sandbox)
router.post('/initiate/:invoiceId', protect, initiatePayment);
router.post('/simulate', protect, simulatePayment);
router.post('/sandbox-simulate', protect, sandboxSimulatePayment);

// Payment History & Receipt
router.get('/history', protect, getPaymentsHistory);
router.get('/receipt/:transactionId', protect, getPaymentReceipt);

// Legacy SSLCommerz Callbacks (Mock / Harmless)
router.all('/sslcommerz/success', sslcommerzSuccess);
router.all('/sslcommerz/fail', sslcommerzFail);
router.all('/sslcommerz/cancel', sslcommerzCancel);
router.post('/sslcommerz/ipn', sslcommerzIpn);

module.exports = router;
