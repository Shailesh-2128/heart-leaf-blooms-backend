const express = require("express");
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const {
    createOrder,
    getAllOrders,
    getVendorOrders,
    updateOrderStatus,
    updateOrderItemStatus,
    getUserOrders,
    getOrderById
} = require("../controllers/orderController");

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         order_id:
 *           type: string
 *           description: Auto-generated UUID
 *         user_id:
 *           type: string
 *         total_amount:
 *           type: number
 *         payment_status:
 *           type: string
 *           enum: [pending, paid, failed]
 *         order_status:
 *           type: string
 *           enum: [pending, processing, shipped, delivered, cancelled]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         orderItems:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *     OrderItem:
 *       type: object
 *       properties:
 *         order_item_id:
 *           type: string
 *         order_id:
 *           type: string
 *         product_id:
 *           type: string
 *         vendor_id:
 *           type: string
 *         price:
 *           type: number
 *         quantity:
 *           type: integer
 *         status:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: Order
 *   description: Order management API
 */

/**
 * @swagger
 * /order/user/{userId}:
 *   get:
 *     summary: Get all orders for a specific user
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User order history
 */
router.get('/user/:userId', verifyToken, getUserOrders);

/**
 * @swagger
 * /order/admin:
 *   get:
 *     summary: Get all orders (Admin)
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
router.get("/admin", verifyToken, getAllOrders);

/**
 * @swagger
 * /order/{orderId}:
 *   get:
 *     summary: Get single order details (Status)
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 */
router.get('/:orderId', verifyToken, getOrderById);

/**
 * @swagger
 * /order:
 *   post:
 *     summary: Place a new order
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: string
 *               contact_number:
 *                 type: string
 *                 description: Optional contact number to update user profile
 *     responses:
 *       201:
 *         description: Order placed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Cart is empty or invalid
 *       500:
 *         description: Server error
 */
router.post("/", verifyToken, createOrder);



/**
 * @swagger
 * /order/admin/{orderId}:
 *   put:
 *     summary: Update order status (Admin)
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 */
router.put("/admin/:orderId", verifyToken, updateOrderStatus);

/**
 * @swagger
 * /order/vendor/{vendorId}:
 *   get:
 *     summary: Get orders for a specific vendor
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of specific vendor orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrderItem'
 */
router.get("/vendor/:vendorId", verifyToken, getVendorOrders);

/**
 * @swagger
 * /order/item/{itemId}:
 *   put:
 *     summary: Update order item status (Vendor)
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 item:
 *                   $ref: '#/components/schemas/OrderItem'
 */
router.put("/item/:itemId", verifyToken, updateOrderItemStatus);

module.exports = router;
