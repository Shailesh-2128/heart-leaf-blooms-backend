const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Create Razorpay Order
router.post('/create-order', paymentController.createRazorpayOrder);

// Verify Payment
router.post('/verify', paymentController.verifyPayment);

// Create Vendor Payout
router.post('/vendor-payout', paymentController.createVendorPayout);

module.exports = router;
