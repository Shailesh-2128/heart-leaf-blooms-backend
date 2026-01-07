const express = require("express");
const vendorRoute = express.Router();
const {
    createVendor,
    loginVendor,
    getAllVendors,
    getVendor,
    updateVendor,
    deleteVendor,
    approveVendor
} = require("../controllers/vendorController");

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
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               shopName:
 *                 type: string
 *               shopAddress:
 *                 type: string
 *               shopDescription:
 *                   type: string
 *               bankName:
 *                   type: string
 *               IFSC:
 *                   type: string
 *               accountNumber:
 *                   type: string
 *     responses:
 *       201:
 *         description: Vendor application submitted
 *       400:
 *         description: Error
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
 *             properties:
 *               vendorId:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
vendorRoute.post("/login", loginVendor);

/**
 * @swagger
 * /vendor:
 *   get:
 *     summary: Get all vendors
 *     tags: [Vendor]
 *     responses:
 *       200:
 *         description: List of vendors
 */
vendorRoute.get("/", getAllVendors);

/**
 * @swagger
 * /vendor/{id}:
 *   get:
 *     summary: Get vendor by ID
 *     tags: [Vendor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor details
 *       404:
 *         description: Vendor not found
 */
vendorRoute.get("/:id", getVendor);

/**
 * @swagger
 * /vendor/{id}:
 *   put:
 *     summary: Update vendor
 *     tags: [Vendor]
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
 *     responses:
 *       200:
 *         description: Updated successfully
 */
vendorRoute.put("/:id", updateVendor);

/**
 * @swagger
 * /vendor/{id}:
 *   delete:
 *     summary: Delete vendor
 *     tags: [Vendor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted successfully
 */
vendorRoute.delete("/:id", deleteVendor);

/**
 * @swagger
 * /vendor/approve/{id}:
 *   put:
 *     summary: Approve vendor (Admin only)
 *     tags: [Vendor]
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
 *             properties:
 *               status:
 *                 type: string
 *               vendorTag:
 *                 type: string
 *               isFeatured:
 *                 type: boolean
 *               isVerified:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Vendor approved
 */
vendorRoute.put("/approve/:id", approveVendor);

module.exports = vendorRoute;
