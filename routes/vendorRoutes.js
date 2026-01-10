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
 *             required:
 *               - name
 *               - email
 *               - password
 *               - shopName
 *               - shopAddress
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
const verifyToken = require('../middlewares/authMiddleware');

vendorRoute.post("/register", createVendor);
vendorRoute.post("/login", loginVendor);
vendorRoute.post("/logout", logoutVendor);

vendorRoute.get("/", verifyToken, getAllVendors);
vendorRoute.get("/:id", verifyToken, getVendor);
vendorRoute.put("/:id", verifyToken, updateVendor);
vendorRoute.delete("/:id", verifyToken, deleteVendor);
vendorRoute.put("/approve/:id", verifyToken, approveVendor);

module.exports = vendorRoute;
