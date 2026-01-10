const express = require("express");
const router = express.Router();
const {
    addToCart,
    updateCartItem,
    deleteCartItem
} = require("../controllers/cartController");

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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 */
const verifyToken = require('../middlewares/authMiddleware');

router.post("/:id", verifyToken, addToCart);
router.put("/:id/:cartId", verifyToken, updateCartItem);
router.delete("/:id/:cartId", verifyToken, deleteCartItem);

module.exports = router;
