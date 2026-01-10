const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const verifyToken = require('../middlewares/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         payment_id:
 *           type: string
 *         order_id:
 *           type: string
 *         vendor_id:
 *           type: string
 *         amount:
 *           type: number
 *         payment_method:
 *           type: string
 *         payment_status:
 *           type: string
 *         payment_type:
 *           type: string
 *         transaction_id:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

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
 *     security:
 *       - bearerAuth: []
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 currency:
 *                   type: string
 *                 amount:
 *                   type: number
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
 *     security:
 *       - bearerAuth: []
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 payment:
 *                   $ref: '#/components/schemas/Payment'
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
 *     security:
 *       - bearerAuth: []
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 payout:
 *                   $ref: '#/components/schemas/Payment'
 *       500:
 *         description: Server error
 */
router.post('/vendor-payout', verifyToken, paymentController.createVendorPayout);

module.exports = router;
