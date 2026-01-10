const express = require('express');
const router = express.Router();
const { createAdmin, loginAdmin, logoutAdmin, displayAdmin, updateAdmin, getVendorPayoutStats } = require('../controllers/adminCotrollers');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management API
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
const verifyToken = require('../middlewares/authMiddleware');

router.post('/create', createAdmin);
router.post('/login', loginAdmin);
router.post('/logout', logoutAdmin);

router.get('/display/:id', verifyToken, displayAdmin);
router.put('/update/:id', verifyToken, updateAdmin);
router.get('/payout-stats', verifyToken, getVendorPayoutStats);

/**
 * @swagger
 * /admin/payout-stats:
 *   get:
 *     summary: Get vendor payout statistics
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of vendor stats
 */
router.get('/payout-stats', getVendorPayoutStats);

module.exports = router;
