const express = require('express');
const router = express.Router();
const { createAdmin, loginAdmin, logoutAdmin, displayAdmin, updateAdmin, getVendorPayoutStats, listVendors, listUsers } = require('../controllers/adminCotrollers');
const { getInventory } = require('../controllers/adminInventoryController');
const verifyToken = require('../middlewares/authMiddleware');

// ... (existing swagger) ...

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user_id:
 *                     type: string
 *                   username:
 *                     type: string
 *                   user_email:
 *                     type: string
 *                   mobile_number:
 *                     type: string
 *                   addresses:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/Address'
 */
router.get('/users', verifyToken, listUsers);

// Uncommented Vendor List
/**
 * @swagger
 * /admin/vendor-list:
 *   get:
 *     summary: Get all vendors (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all vendors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vendor'
 */
router.get('/vendor-list', verifyToken, listVendors);

// ... existing routes ...

module.exports = router;

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

// /**
//  * @swagger
//  * /admin/payout-stats:
//  *   get:
//  *     summary: Get vendor payout statistics
//  *     tags: [Admin]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: List of vendor stats
//  */
// router.get('/payout-stats', verifyToken, getVendorPayoutStats);
// // router.get('/payout-stats', getVendorPayoutStats); // Removed duplicate unprotected route



/**
 * @swagger
 * /admin/inventory:
 *   get:
 *     summary: Get inventory of all products (Admin & Vendor)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of inventory items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Product ID
 *                   name:
 *                     type: string
 *                     description: Product Name
 *                   title:
 *                     type: string
 *                     description: Product Title
 *                   price:
 *                     type: number
 *                     description: Product Price
 *                   stock:
 *                     type: integer
 *                     nullable: true
 *                     description: Stock count (null for vendor products)
 *                   status:
 *                     type: string
 *                     description: Product Status
 *                   owner_type:
 *                     type: string
 *                     example: Admin or Vendor
 *                   owner_name:
 *                     type: string
 *                     description: Name of the owner (Admin or Vendor Shop)
 *                   image:
 *                     type: string
 *                     nullable: true
 *                     description: Product Image URL
 *                   inventory_status:
 *                     type: string
 *                     description: Derived status (In Stock, Out of Stock, Available, Unavailable)
 */
router.get('/inventory', verifyToken, getInventory);

const { getDashboardStats } = require('../controllers/adminStatsController');

// ... (existing imports)

/**
 * @swagger
 * /admin/dashboard-stats:
 *   get:
 *     summary: Get dashboard statistics (Admin Home)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ordersToday:
 *                   type: integer
 *                 totalRevenue:
 *                   type: number
 *                 totalInventory:
 *                   type: integer
 *                 totalUsers:
 *                   type: integer
 *                 recentOrders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 */
router.get('/dashboard-stats', verifyToken, getDashboardStats);

module.exports = router;
