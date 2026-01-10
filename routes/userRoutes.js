const express = require("express");
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const {
    createUser,
    loginUser,
    logoutUser,
    getUser,
    updateUser,
    deleteUser,
    addAddress,
    getAllUsers
} = require("../controllers/userControllers");

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - user_email
 *         - user_password
 *       properties:
 *         user_id:
 *           type: string
 *           description: The auto-generated id of the user
 *         username:
 *           type: string
 *           description: The username
 *         user_email:
 *           type: string
 *           description: The user email
 *         user_password:
 *           type: string
 *           description: The user password
 *         addresses:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Address'
 *         cart:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Cart'
 *         wishlist:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Wishlist'
 *     Address:
 *       type: object
 *       required:
 *         - address
 *         - city
 *         - state
 *         - pincode
 *       properties:
 *         address_id:
 *           type: integer
 *           description: The auto-generated id of the address
 *         address:
 *           type: string
 *           description: The street address
 *         city:
 *           type: string
 *           description: The city
 *         state:
 *           type: string
 *           description: The state
 *         pincode:
 *           type: string
 *           description: The pincode
 *     Cart:
 *       type: object
 *       properties:
 *         cart_id:
 *           type: integer
 *           description: The auto-generated id of the cart item
 *         product_id:
 *           type: string
 *           description: The product id
 *         quantity:
 *           type: integer
 *           description: The quantity
 *     Wishlist:
 *       type: object
 *       properties:
 *         wishlist_id:
 *           type: integer
 *           description: The auto-generated id of the wishlist item
 *         product_id:
 *           type: string
 *           description: The product id
 */

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management API
 */

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Email already exists
 */
router.post("/register", createUser);

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: User login
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_email
 *               - user_password
 *             properties:
 *               user_email:
 *                 type: string
 *               user_password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", loginUser);

/**
 * @swagger
 * /user/logout:
 *   post:
 *     summary: User logout
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logout", logoutUser);

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [User]
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
 *                 $ref: '#/components/schemas/User'
 */
router.get("/", verifyToken, getAllUsers);

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get("/:id", verifyToken, getUser);

/**
 * @swagger
 * /user/{id}:
 *   put:
 *     summary: Update user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               user_password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 */
router.put("/:id", verifyToken, updateUser);

/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 */
router.delete("/:id", verifyToken, deleteUser);

/**
 * @swagger
 * /user/{id}/address:
 *   post:
 *     summary: Add an address to user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
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
 *               - address
 *               - city
 *               - state
 *               - pincode
 *             properties:
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               pincode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Address added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Address'
 */
router.post("/:id/address", verifyToken, addAddress);

// Cart and Wishlist routes moved to separate files
module.exports = router;
