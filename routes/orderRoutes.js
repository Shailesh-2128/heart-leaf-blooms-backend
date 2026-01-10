const express = require("express");
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const {
    createOrder,
    getAllOrders,
    getVendorOrders,
    updateOrderStatus,
    updateOrderItemStatus
} = require("../controllers/orderController");

/**
 * @swagger
 * tags:
 *   name: Order
 *   description: Order management API
 */

/**
 * @swagger
 * /order:
 *   post:
 *     summary: Place a new order
 *     tags: [Order]
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
 *     responses:
 *       201:
 *         description: Order placed successfully
 */
router.post("/", verifyToken, createOrder);

/**
 * @swagger
 * /order/admin:
 *   get:
 *     summary: Get all orders (Admin)
 *     tags: [Order]
 *     responses:
 *       200:
 *         description: List of all orders
 */
router.get("/admin", verifyToken, getAllOrders);

/**
 * @swagger
 * /order/admin/{orderId}:
 *   put:
 *     summary: Update order status (Admin)
 *     tags: [Order]
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
 */
router.put("/admin/:orderId", verifyToken, updateOrderStatus);

/**
 * @swagger
 * /order/vendor/{vendorId}:
 *   get:
 *     summary: Get orders for a specific vendor
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of specific vendor oders
 */
router.get("/vendor/:vendorId", verifyToken, getVendorOrders);

/**
 * @swagger
 * /order/item/{itemId}:
 *   put:
 *     summary: Update order item status (Vendor)
 *     tags: [Order]
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
 */
router.put("/item/:itemId", verifyToken, updateOrderItemStatus);

module.exports = router;
