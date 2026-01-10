const prisma = require("../config/prisma");

// Create Product (Vendor)
const createProduct = async (req, res) => {
    try {
        console.log("Create Product Request:", JSON.stringify(req.body, null, 2));

        const {
            vendor_id,
            category_id,
            product_name,
            product_title,
            product_description,
            product_price,
            discount_price,
            product_guide,
            product_images // Array of strings (URLs)
        } = req.body;

        // Verify Vendor
        const vendor = await prisma.vendor.findUnique({ where: { id: vendor_id } });
        if (!vendor) return res.status(404).json({ error: "Vendor not found" });

        // Verify Category
        const category = await prisma.category.findUnique({ where: { category_id: parseInt(category_id) } });
        if (!category) return res.status(404).json({ error: "Category not found" });

        // Prepare Image Data
        let imageData = [];

        // The frontend now sends 'product_images' as a flat array of URLs strings 
        // after uploading via /upload-image endpoint.
        // Format from frontend: [large1, medium1, small1, large2, medium2, small2, ...]

        if (req.body.product_images) {
            let urls = req.body.product_images;
            if (!Array.isArray(urls)) urls = [urls];

            // We expect groups of 3 (large, medium, small)
            // But let's be safe. If the array is not a multiple of 3, we might have an issue, 
            // or maybe the user sent just mixed urls? 
            // Assumption based on frontend code: it pushes [large, medium, small] for each file.

            for (let i = 0; i < urls.length; i += 3) {
                // Ensure we have enough items
                const large = urls[i];
                const medium = urls[i + 1];
                const small = urls[i + 2];

                if (!large || !medium || !small) {
                    console.warn(`[CreateProduct] WARN: Missing image URL(s) at group index ${i / 3}. Got:`, { large, medium, small });
                }

                if (large && medium && small) {
                    imageData.push({
                        large_url: String(large),
                        medium_url: String(medium),
                        small_url: String(small)
                    });
                }
            }
            if (imageData.length === 0) {
                console.warn("[CreateProduct] WARN: product_images provided but no valid triplets found!");
            }
        }

        const prismaData = {
            vendor_id,
            category_id: parseInt(category_id),
            product_name,
            product_title,
            product_description,
            product_price,
            discount_price,
            product_guide,
            images: {
                create: imageData
            }
        };

        console.log("DB Insertion Data:", JSON.stringify(prismaData, null, 2));

        const newProduct = await prisma.product.create({
            data: prismaData,
            include: {
                images: true,
                category: true,
                vendor: true
            }
        });

        console.log("DB Result Product ID:", newProduct.product_id);
        console.log("DB Result Images Count:", newProduct.images ? newProduct.images.length : 0);

        res.status(201).json({ message: "Product created successfully", product: newProduct });
    } catch (error) {
        console.error("Create Product DB Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// Get All Products
const getAllProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: {
                images: true,
                category: true,
                vendor: {
                    select: {
                        name: true,
                        shopName: true
                    }
                }
            }
        });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Single Product
const getProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { product_id: id },
            include: {
                images: true,
                category: true,
                vendor: true
            }
        });

        if (!product) return res.status(404).json({ error: "Product not found" });

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Product
// Update Product
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // 1. Fetch Existing Product to check ownership
        const existingProduct = await prisma.product.findUnique({
            where: { product_id: id }
        });

        if (!existingProduct) {
            return res.status(404).json({ error: "Product not found" });
        }

        // 2. Check Ownership (if requester is a vendor)
        // req.user is set by authMiddleware
        if (req.user && req.user.role === 'vendor') {
            if (existingProduct.vendor_id !== req.user.id) {
                return res.status(403).json({ error: "Unauthorized: You can only update your own products" });
            }
        }

        // 3. Prepare Update Data (Sanitize)
        const { product_images, ...rest } = data;
        let updateData = {};

        if (rest.product_name) updateData.product_name = rest.product_name;
        if (rest.product_title) updateData.product_title = rest.product_title;
        if (rest.product_description) updateData.product_description = rest.product_description;
        if (rest.product_guide) updateData.product_guide = rest.product_guide;

        if (rest.product_price) updateData.product_price = parseFloat(rest.product_price);
        if (rest.discount_price !== undefined) updateData.discount_price = rest.discount_price ? parseFloat(rest.discount_price) : null;
        if (rest.category_id) updateData.category_id = parseInt(rest.category_id);
        if (rest.is_available !== undefined) updateData.is_available = rest.is_available; // Boolean

        // 4. Update Scalar Fields
        const updatedProduct = await prisma.product.update({
            where: { product_id: id },
            data: updateData
        });

        // 5. Handle New Images (Append)
        let newImages = [];
        if (product_images) {
            let urls = product_images;
            if (!Array.isArray(urls)) urls = [urls];

            // Expect triplets [large, medium, small]
            for (let i = 0; i < urls.length; i += 3) {
                const large = urls[i];
                const medium = urls[i + 1];
                const small = urls[i + 2];

                if (large && medium && small) {
                    newImages.push({
                        product_id: id,
                        large_url: String(large),
                        medium_url: String(medium),
                        small_url: String(small)
                    });
                }
            }
        }

        if (newImages.length > 0) {
            await prisma.image.createMany({
                data: newImages
            });
        }

        // 6. Return Updated Product with Relations
        const finalProduct = await prisma.product.findUnique({
            where: { product_id: id },
            include: {
                images: true,
                category: true,
                vendor: true
            }
        });

        res.status(200).json({ message: "Product updated", product: finalProduct });
    } catch (error) {
        console.error("Update Product Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// Delete Product
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Cascade delete images
        await prisma.image.deleteMany({ where: { product_id: id } });

        await prisma.product.delete({
            where: { product_id: id }
        });

        res.status(200).json({ message: "Product deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Products by Category
const getProductsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const products = await prisma.product.findMany({
            where: { category_id: parseInt(categoryId) },
            include: { images: true }
        });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Products by Vendor
const getProductsByVendor = async (req, res) => {
    try {
        const { vendorId } = req.params;
        console.log("Fetching products for vendor ID:", vendorId);

        const products = await prisma.product.findMany({
            where: { vendor_id: vendorId },
            include: { images: true }
        });

        console.log(`Found ${products.length} products for vendor.`);
        res.status(200).json(products);
    } catch (error) {
        console.error("Get Vendor Products Error:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    getProductsByVendor
};
