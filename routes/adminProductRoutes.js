const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const {
    createAdminProduct,
    getAllAdminProducts,
    getPublicAdminProducts,
    getAdminProduct,
    updateAdminProduct,
    deleteAdminProduct
} = require('../controllers/adminProductController');

// All routes are protected and arguably should be admin-only.
// Assuming verifyToken checks for valid user, and admin check is implicit or needed.
// Ideally, we add an isAdmin middleware, but I'll stick to verifyToken for now as requested.

/**
 * @swagger
 * components:
 *   schemas:
 *     AdminProduct:
 *       type: object
 *       properties:
 *         product_id:
 *           type: string
 *           description: Auto-generated UUID
 *         admin_id:
 *           type: string
 *           description: ID of the admin who created the product
 *         category_id:
 *           type: integer
 *           description: ID of the category
 *         product_name:
 *           type: string
 *           description: Internal name of the product
 *         product_title:
 *           type: string
 *           description: Display title of the product
 *         product_description:
 *           type: string
 *           description: Detailed description
 *         product_price:
 *           type: number
 *           format: float
 *           description: Base price
 *         discount_price:
 *           type: number
 *           format: float
 *           description: Discounted price (optional)
 *         product_guide:
 *           type: string
 *           description: Guide or instructions for the product
 *         stock:
 *           type: integer
 *           description: Inventory count
 *         slug:
 *           type: string
 *           description: URL-friendly identifier
 *         is_featured:
 *           type: boolean
 *           description: Feature status
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *           description: Product status
 *         images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductImage'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   name: AdminProducts
 *   description: Product management for Admins (Store Products)
 */

/**
 * @swagger
 * /admin/products/public:
 *   get:
 *     summary: Get all public admin products (User view)
 *     tags: [AdminProducts]
 *     responses:
 *       200:
 *         description: List of active products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdminProduct'
 */
router.get('/public', getPublicAdminProducts);

/**
 * @swagger
 * /admin/products:
 *   post:
 *     summary: Create a new admin product
 *     tags: [AdminProducts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category_id
 *               - product_name
 *               - product_price
 *             properties:
 *               category_id:
 *                 type: integer
 *               product_name:
 *                 type: string
 *               product_title:
 *                 type: string
 *               product_description:
 *                 type: string
 *               product_guide:
 *                 type: string
 *               product_price:
 *                 type: number
 *               discount_price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               is_featured:
 *                 type: boolean
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *               product_images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Flat array of image URLs (Large, Medium, Small triplets)
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 product:
 *                   $ref: '#/components/schemas/AdminProduct'
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.post('/', verifyToken, createAdminProduct);

/**
 * @swagger
 * /admin/products:
 *   get:
 *     summary: Get all admin products (Admin Panel)
 *     tags: [AdminProducts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or title
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         description: Filter by category ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdminProduct'
 *       500:
 *         description: Server error
 */
router.get('/', verifyToken, getAllAdminProducts);

/**
 * @swagger
 * /admin/products/{id}:
 *   get:
 *     summary: Get admin product details by ID
 *     tags: [AdminProducts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product UUID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminProduct'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get('/:id', verifyToken, getAdminProduct);

/**
 * @swagger
 * /admin/products/{id}:
 *   put:
 *     summary: Update admin product
 *     tags: [AdminProducts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category_id:
 *                 type: integer
 *               product_name:
 *                 type: string
 *               product_title:
 *                 type: string
 *               product_description:
 *                 type: string
 *               product_guide:
 *                 type: string
 *               product_price:
 *                 type: number
 *               discount_price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               is_featured:
 *                 type: boolean
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *               product_images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: New images (flattened array of L/M/S URLs) to append
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 product:
 *                   $ref: '#/components/schemas/AdminProduct'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.put('/:id', verifyToken, updateAdminProduct);

/**
 * @swagger
 * /admin/products/{id}:
 *   delete:
 *     summary: Soft delete admin product
 *     tags: [AdminProducts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product UUID
 *     responses:
 *       200:
 *         description: Product deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Product not foundOr already deleted
 *       500:
 *         description: Server error
 */
router.delete('/:id', verifyToken, deleteAdminProduct);

module.exports = router;
