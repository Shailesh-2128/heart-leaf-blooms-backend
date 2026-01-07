const express = require("express");
const router = express.Router();
const {
    createProduct,
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    getProductsByVendor
} = require("../controllers/productController");
const upload = require("../middlewares/uploadImage");

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - vendor_id
 *         - category_id
 *         - product_name
 *         - product_price
 *       properties:
 *         product_id:
 *           type: string
 *         vendor_id:
 *           type: string
 *         category_id:
 *           type: integer
 *         product_name:
 *           type: string
 *         product_title:
 *           type: string
 *         product_description:
 *           type: string
 *         product_price:
 *           type: number
 *         discount_price:
 *           type: number
 *         product_guide:
 *           type: string
 *         product_images:
 *           type: array
 *           items:
 *             type: string
 *             description: URL of the image
 */

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: Product management
 */

/**
 * @swagger
 * /product:
 *   post:
 *     summary: Create a new product (Vendor)
 *     tags: [Product]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created
 */
router.post("/", upload.array('product_images', 5), createProduct);

/**
 * @swagger
 * /product:
 *   get:
 *     summary: Get all products
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: List of products
 */
router.get("/", getAllProducts);

/**
 * @swagger
 * /product/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 */
router.get("/:id", getProduct);

/**
 * @swagger
 * /product/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Product]
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
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Updated
 */
router.put("/:id", upload.array('product_images', 5), updateProduct);

/**
 * @swagger
 * /product/{id}:
 *   delete:
 *     summary: Delete product
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete("/:id", deleteProduct);

/**
 * @swagger
 * /product/category/{categoryId}:
 *   get:
 *     summary: Get products by category
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of products
 */
router.get("/category/:categoryId", getProductsByCategory);

/**
 * @swagger
 * /product/vendor/{vendorId}:
 *   get:
 *     summary: Get products by vendor
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of products
 */
router.get("/vendor/:vendorId", getProductsByVendor);

module.exports = router;
