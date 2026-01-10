const express = require("express");
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const {
    addToWishlist,
    deleteWishlistItem
} = require("../controllers/wishlistController");

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
 *             properties:
 *               product_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Item added to wishlist
 */
router.post("/:id", verifyToken, addToWishlist);

/**
 * @swagger
 * /wishlist/{id}/{wishlistId}:
 *   delete:
 *     summary: Remove item from wishlist
 *     tags: [Wishlist]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: wishlistId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item removed from wishlist
 */
router.delete("/:id/:wishlistId", verifyToken, deleteWishlistItem);

module.exports = router;
