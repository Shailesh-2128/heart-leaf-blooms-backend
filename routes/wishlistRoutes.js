const express = require("express");
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const {
    addToWishlist,
    deleteWishlistItem
} = require("../controllers/wishlistController");

/**
 * @swagger
 * components:
 *   schemas:
 *     WishlistItem:
 *       type: object
 *       properties:
 *         wishlist_id:
 *           type: integer
 *         user_id:
 *           type: string
 *         product_id:
 *           type: string
 *         product:
 *           $ref: '#/components/schemas/Product'
 */

/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: Wishlist management API
 */

/**
 * @swagger
 * /wishlist/{id}:
 *   post:
 *     summary: Add item to user wishlist
 *     tags: [Wishlist]
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
 *             properties:
 *               product_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Item added to wishlist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 item:
 *                   $ref: '#/components/schemas/WishlistItem'
 *       400:
 *         description: Item already in wishlist
 *       500:
 *         description: Server error
 */
router.post("/:id", verifyToken, addToWishlist);

/**
 * @swagger
 * /wishlist/{id}/{wishlistId}:
 *   delete:
 *     summary: Remove item from wishlist
 *     tags: [Wishlist]
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
 *         name: wishlistId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Wishlist Item ID
 *     responses:
 *       200:
 *         description: Item removed from wishlist
 *       404:
 *         description: Wishlist item not found
 *       500:
 *         description: Server error
 */
router.delete("/:id/:wishlistId", verifyToken, deleteWishlistItem);

module.exports = router;
