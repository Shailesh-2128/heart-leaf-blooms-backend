const express = require('express');
const router = express.Router();
const { createAdmin, loginAdmin, logoutAdmin, displayAdmin, updateAdmin, getVendorPayoutStats } = require('../controllers/adminCotrollers');
const verifyToken = require('../middlewares/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Admin:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated UUID
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *           format: password
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
 *   name: Admin
 *   description: Admin management and statistics
 */

/**
 * @swagger
 * /admin/create:
 *   post:
 *     summary: Create a new admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       500:
 *         description: Server error
 */
router.post('/create', createAdmin);

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Login admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: secret
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 admin:
 *                   $ref: '#/components/schemas/Admin'
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: Admin not found
 */
router.post('/login', loginAdmin);

/**
 * @swagger
 * /admin/logout:
 *   post:
 *     summary: Logout admin
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', logoutAdmin);

/**
 * @swagger
 * /admin/display/{id}:
 *   get:
 *     summary: Get admin details by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin UUID
 *     responses:
 *       200:
 *         description: Admin details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Admin'
 *       404:
 *         description: Admin not found
 */
router.get('/display/:id', verifyToken, displayAdmin);

/**
 * @swagger
 * /admin/update/{id}:
 *   put:
 *     summary: Update admin details
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 admin:
 *                   $ref: '#/components/schemas/Admin'
 *       400:
 *         description: Invalid input or email exists
 *       404:
 *         description: Admin not found
 */
router.put('/update/:id', verifyToken, updateAdmin);

/**
 * @swagger
 * /admin/payout-stats:
 *   get:
 *     summary: Get vendor payout statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of vendor stats
 */
router.get('/payout-stats', verifyToken, getVendorPayoutStats);
// router.get('/payout-stats', getVendorPayoutStats); // Removed duplicate unprotected route

module.exports = router;
