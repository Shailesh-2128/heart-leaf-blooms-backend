const express = require("express");
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const {
    createProduct,
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    getProductsByVendor
} = require("../controllers/productController");
const { uploadProductImage } = require("../controllers/productImageController");
const upload = require("../middlewares/uploadImage");
const localUpload = require("../middlewares/localUpload");

/**
 * @swagger
 * components:
 *   schemas:
 *     ProductImage:
 *       type: object
 *       properties:
 *         large_url:
 *           type: string
 *         medium_url:
 *           type: string
 *         small_url:
 *           type: string
 *
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
 *           description: Auto-generated UUID
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
 *         product_guide:
 *           type: string
 *         product_price:
 *           type: number
 *         discount_price:
 *           type: number
 *         images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductImage'
 */

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: Product management endpoints
 */

/**
 * @swagger
 * /product/upload-image:
 *   post:
 *     summary: Upload and resize a single product image
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     description: Uploads an image, resizes it to Large (1200x1200), Medium (600x600), and Small (300x300), uploads them to S3, and returns the URLs.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload (jpg, png, webp, svg)
 *     responses:
 *       200:
 *         description: Image processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Image uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     large:
 *                       type: string
 *                       description: URL of the large version
 *                     medium:
 *                       type: string
 *                       description: URL of the medium version
 *                     small:
 *                       type: string
 *                       description: URL of the small version
 *       400:
 *         description: Invalid file or missing image
 *       500:
 *         description: Server error processing image
 */
router.post("/upload-image", verifyToken, localUpload.single('image'), uploadProductImage);

/**
 * @swagger
 * /product:
 *   post:
 *     summary: Create a new product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     description: Create a product with associated images. Format 'product_images' as a flat array of URL strings [L, M, S, L, M, S...].
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vendor_id
 *               - category_id
 *               - product_name
 *               - product_price
 *             properties:
 *               vendor_id:
 *                 type: string
 *               category_id:
 *                 type: integer
 *               product_name:
 *                 type: string
 *               product_title:
 *                 type: string
 *               product_description:
 *                 type: string
 *               product_price:
 *                 type: number
 *               discount_price:
 *                 type: number
 *               product_guide:
 *                 type: string
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
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Vendor or Category not found
 *       500:
 *         description: Server error
 */
router.post("/", verifyToken, createProduct);

/**
 * @swagger
 * /product:
 *   get:
 *     summary: Get all products
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: List of all products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get("/", getAllProducts);

/**
 * @swagger
 * /product/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     tags: [Product]
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
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get("/:id", getProduct);

/**
 * @swagger
 * /product/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Product]
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
 *             properties:
 *               product_name:
 *                 type: string
 *               product_price:
 *                 type: number
 *               product_images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: New images to add (flat array of L/M/S strings)
 *     responses:
 *       200:
 *         description: Product updated
 *       404:
 *         description: Product not found
 */
router.put("/:id", verifyToken, updateProduct);

/**
 * @swagger
 * /product/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Product]
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
 *         description: Product deleted
 *       404:
 *         description: Product not found
 */
router.delete("/:id", verifyToken, deleteProduct);

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
