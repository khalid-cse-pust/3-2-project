const express = require('express');
const router = express.Router();
const {
  getInvoices,
  createInvoice,
  initiatePayment,
  sslcommerzSuccess,
  sslcommerzFail,
  sslcommerzCancel,
  sslcommerzIpn,
  sandboxSimulatePayment,
  getPaymentsHistory,
} = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

// Invoices
router.route('/invoices').get(protect, getInvoices).post(protect, admin, createInvoice);

// Payment Initiation
router.post('/initiate/:invoiceId', protect, initiatePayment);
router.post('/sandbox-simulate', protect, sandboxSimulatePayment);

// Payment History
router.get('/history', protect, getPaymentsHistory);

// SSLCommerz Callbacks (support both POST and GET)
router.all('/sslcommerz/success', sslcommerzSuccess);
router.all('/sslcommerz/fail', sslcommerzFail);
router.all('/sslcommerz/cancel', sslcommerzCancel);
router.post('/sslcommerz/ipn', sslcommerzIpn);

module.exports = router;
