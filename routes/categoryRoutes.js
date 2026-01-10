const express = require("express");
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory
} = require("../controllers/categoryController");

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - category_name
 *         - category_description
 *         - category_icon
 *       properties:
 *         category_id:
 *           type: integer
 *           description: Auto-generated ID
 *         category_name:
 *           type: string
 *         category_description:
 *           type: string
 *         category_icon:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: Category
 *   description: Category management (Admin only for modifications)
 */

/**
 * @swagger
 * /category:
 *   post:
 *     summary: Create a new category (Admin)
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 category:
 *                   $ref: '#/components/schemas/Category'
 *       500:
 *         description: Server error
 */
router.post("/", verifyToken, createCategory);

/**
 * @swagger
 * /category:
 *   get:
 *     summary: Get all categories
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
router.get("/", getAllCategories);

/**
 * @swagger
 * /category/{id}:
 *   put:
 *     summary: Update category (Admin)
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 category:
 *                   $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.put("/:id", verifyToken, updateCategory);

/**
 * @swagger
 * /category/{id}:
 *   delete:
 *     summary: Delete category (Admin)
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", verifyToken, deleteCategory);

module.exports = router;
