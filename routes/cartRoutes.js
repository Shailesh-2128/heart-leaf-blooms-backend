const express = require("express");
const router = express.Router();
const {
    addToCart,
    updateCartItem,
    deleteCartItem
} = require("../controllers/cartController");
const verifyToken = require('../middlewares/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       properties:
 *         cart_id:
 *           type: integer
 *           description: Auto-generated ID
 *         user_id:
 *           type: string
 *         product_id:
 *           type: string
 *         quantity:
 *           type: integer
 *         product:
 *           $ref: '#/components/schemas/Product'
 */

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Cart management API
 */

/**
 * @swagger
 * /cart/{id}:
 *   post:
 *     summary: Add item to user cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - quantity
 *             properties:
 *               product_id:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Item added to cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 item:
 *                   $ref: '#/components/schemas/CartItem'
 *       500:
 *         description: Server error
 */
router.post("/:id", verifyToken, addToCart);

/**
 * @swagger
 * /cart/{id}/{cartId}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cart item updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 item:
 *                   $ref: '#/components/schemas/CartItem'
 *       500:
 *         description: Server error
 */
router.put("/:id/:cartId", verifyToken, updateCartItem);

/**
 * @swagger
 * /cart/{id}/{cartId}:
 *   delete:
 *     summary: Delete item from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart Item ID
 *     responses:
 *       200:
 *         description: Cart item removed
 *       404:
 *         description: Cart item not found
 *       500:
 *         description: Server error
 */
router.delete("/:id/:cartId", verifyToken, deleteCartItem);

module.exports = router;
