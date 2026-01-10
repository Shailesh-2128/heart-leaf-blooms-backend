const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const verifyToken = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment and Payout API
 */

/**
 * @swagger
 * /payment/create-order:
 *   post:
 *     summary: Create Razorpay Order
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - currency
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount in smallest currency unit (e.g., paise for INR)
 *               currency:
 *                 type: string
 *                 default: INR
 *               receipt:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order created
 *       500:
 *         description: Server error
 */
router.post('/create-order', verifyToken, paymentController.createRazorpayOrder);

/**
 * @swagger
 * /payment/verify:
 *   post:
 *     summary: Verify Razorpay Payment Signature
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - razorpay_order_id
 *               - razorpay_payment_id
 *               - razorpay_signature
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *               razorpay_payment_id:
 *                 type: string
 *               razorpay_signature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *       400:
 *         description: Invalid signature
 */
router.post('/verify', verifyToken, paymentController.verifyPayment);

/**
 * @swagger
 * /payment/vendor-payout:
 *   post:
 *     summary: Record a manual vendor payout (Admin)
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vendor_id
 *               - amount
 *             properties:
 *               vendor_id:
 *                 type: string
 *               amount:
 *                 type: number
 *               payment_method:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payout recorded
 *       500:
 *         description: Server error
 */
router.post('/vendor-payout', verifyToken, paymentController.createVendorPayout);

module.exports = router;
