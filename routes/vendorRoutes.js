const express = require("express");
const vendorRoute = express.Router();
const {
    createVendor,
    loginVendor,
    logoutVendor,
    getAllVendors,
    getVendor,
    updateVendor,
    deleteVendor,
    approveVendor,
    getPublicVendors
} = require("../controllers/vendorController");
const verifyToken = require('../middlewares/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Vendor:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - shopName
 *         - shopAddress
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *           format: password
 *         shopName:
 *           type: string
 *         shopAddress:
 *           type: string
 *         shopDescription:
 *           type: string
 *         bankName:
 *           type: string
 *         accountNumber:
 *           type: string
 *         IFSC:
 *           type: string
 *         vendorTag:
 *           type: string
 *         isFeatured:
 *           type: boolean
 *         isVerified:
 *           type: boolean
 *         status:
 *           type: string
 *         commission_rate:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   name: Vendor
 *   description: Vendor management API
 */

/**
 * @swagger
 * /vendor/register:
 *   post:
 *     summary: Register a new vendor
 *     tags: [Vendor]
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
 *               - shopName
 *               - name
 *               - email
 *               - password
 *               - shopName
 *               - shopAddress
 *               - shopDescription
 *               - bankName
 *               - accountNumber
 *               - IFSC
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *               shopName:
 *                 type: string
 *               shopAddress:
 *                 type: string
 *               shopDescription:
 *                 type: string
 *               bankName:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *               IFSC:
 *                 type: string
 *     responses:
 *       201:
 *         description: Vendor registration submitted successfully
 *       400:
 *         description: Email already exists or invalid input
 *       500:
 *         description: Server error
 */
vendorRoute.post("/register", createVendor);

/**
 * @swagger
 * /vendor/login:
 *   post:
 *     summary: Login vendor
 *     tags: [Vendor]
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
 *                 example: vendor@example.com
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
 *                 vendor:
 *                   $ref: '#/components/schemas/Vendor'
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: Vendor not found
 */
vendorRoute.post("/login", loginVendor);

/**
 * @swagger
 * /vendor/logout:
 *   post:
 *     summary: Logout vendor
 *     tags: [Vendor]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
vendorRoute.post("/logout", logoutVendor);

/**
 * @swagger
 * /vendor:
 *   get:
 *     summary: Get all vendors (Admin only)
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of vendors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vendor'
 */
vendorRoute.get("/", verifyToken, getAllVendors);

/**
 * @swagger
 * /vendor/list:
 *   get:
 *     summary: Get public list of approved vendors
 *     tags: [Vendor]
 *     description: Returns public details of approved vendors (id, shopName, description, address, tags). No Auth required.
 *     responses:
 *       200:
 *         description: List of public vendor info
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   shopName:
 *                     type: string
 *                   shopDescription:
 *                     type: string
 *                   shopAddress:
 *                     type: string
 *                   vendorTag:
 *                     type: string
 *                   isFeatured:
 *                     type: boolean
 *                   isVerified:
 *                     type: boolean
 */
vendorRoute.get("/list", getPublicVendors);

/**
 * @swagger
 * /vendor/{id}:
 *   get:
 *     summary: Get vendor by ID
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vendor ID
 *     responses:
 *       200:
 *         description: Vendor details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vendor'
 *       404:
 *         description: Vendor not found
 */
vendorRoute.get("/:id", verifyToken, getVendor);

/**
 * @swagger
 * /vendor/{id}:
 *   put:
 *     summary: Update vendor details
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vendor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               shopName:
 *                 type: string
 *               shopAddress:
 *                 type: string
 *               shopDescription:
 *                 type: string
 *               bankName:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *               IFSC:
 *                 type: string
 *     responses:
 *       200:
 *         description: Vendor updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 vendor:
 *                   $ref: '#/components/schemas/Vendor'
 *       500:
 *         description: Server error
 */
vendorRoute.put("/:id", verifyToken, updateVendor);

/**
 * @swagger
 * /vendor/{id}:
 *   delete:
 *     summary: Delete vendor
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vendor ID
 *     responses:
 *       200:
 *         description: Vendor deleted
 *       404:
 *         description: Vendor not found
 *       500:
 *         description: Server error
 */
vendorRoute.delete("/:id", verifyToken, deleteVendor);

/**
 * @swagger
 * /vendor/approve/{id}:
 *   put:
 *     summary: Approve or update vendor status (Admin only)
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vendor ID
 *     requestBody:
 *       description: Fields to update for approval/modification
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: approved
 *               vendorTag:
 *                 type: string
 *               isFeatured:
 *                 type: boolean
 *               isVerified:
 *                 type: boolean
 *               commission_rate:
 *                 type: number
 *     responses:
 *       200:
 *         description: Vendor approved/updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 vendor:
 *                   $ref: '#/components/schemas/Vendor'
 *       500:
 *         description: Server error
 */
vendorRoute.put("/approve/:id", verifyToken, approveVendor);

module.exports = vendorRoute;
