const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const { createReview, getTermsReviews, getAllReviews } = require('../controllers/reviewController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         review_id:
 *           type: string
 *           description: Auto-generated UUID
 *         user_id:
 *           type: string
 *         product_id:
 *           type: string
 *           nullable: true
 *         admin_product_id:
 *           type: string
 *           nullable: true
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         review:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   name: Review
 *   description: Product Review Management
 */

/**
 * @swagger
 * /review/admin/all:
 *   get:
 *     summary: Get ALL reviews (Admin)
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 */
router.get('/admin/all', verifyToken, getAllReviews);

/**
 * @swagger
 * /review:
 *   post:
 *     summary: Create a new review
 *     tags: [Review]
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
 *               - rating
 *               - review
 *             properties:
 *               user_id:
 *                 type: string
 *               product_id:
 *                 type: string
 *                 description: Provide this OR admin_product_id
 *               admin_product_id:
 *                 type: string
 *                 description: Provide this OR product_id
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               review:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 review:
 *                   $ref: '#/components/schemas/Review'
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
router.post('/', verifyToken, createReview);

/**
 * @swagger
 * /review/{productId}:
 *   get:
 *     summary: Get reviews for a specific product
 *     tags: [Review]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID (Admin or Vendor)
 *     responses:
 *       200:
 *         description: List of reviews for the product
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       500:
 *         description: Server error
 */
router.get('/:productId', getTermsReviews);

module.exports = router;
