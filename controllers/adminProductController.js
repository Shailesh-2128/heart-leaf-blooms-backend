const prisma = require("../config/prisma");

// Create Admin Product
const createAdminProduct = async (req, res) => {
    try {
        console.log("Create Admin Product Request:", JSON.stringify(req.body, null, 2));

        const {
            category_id,
            product_name,
            product_title,
            product_description,
            product_price,
            discount_price,
            product_guide,
            product_images, // Array of strings (URLs)
            stock,
            slug,
            is_featured,
            status
        } = req.body;

        // Admin ID from token (req.user)
        const admin_id = req.user.id;

        // Verify Category
        const category = await prisma.category.findUnique({ where: { category_id: parseInt(category_id) } });
        if (!category) return res.status(404).json({ error: "Category not found" });

        // Prepare Image Data
        let imageData = [];
        if (product_images) {
            let urls = product_images;
            if (!Array.isArray(urls)) urls = [urls];

            for (let i = 0; i < urls.length; i += 3) {
                const large = urls[i];
                const medium = urls[i + 1];
                const small = urls[i + 2];

                if (large && medium && small) {
                    imageData.push({
                        large_url: String(large),
                        medium_url: String(medium),
                        small_url: String(small)
                    });
                }
            }
        }

        // Generate Slug if not provided
        const finalSlug = slug || product_name.toLowerCase().replace(/ /g, '-') + '-' + Date.now();

        const prismaData = {
            admin_id,
            category_id: parseInt(category_id),
            product_name,
            product_title,
            product_description,
            product_price,
            discount_price,
            product_guide,
            stock: stock ? parseInt(stock) : 0,
            slug: finalSlug,
            is_featured: is_featured || false,
            status: status || 'ACTIVE',
            images: {
                create: imageData
            }
        };

        const newProduct = await prisma.products.create({
            data: prismaData,
            include: {
                images: true,
                category: true,
                admin: true
            }
        });

        res.status(201).json({ message: "Admin Product created successfully", product: newProduct });
    } catch (error) {
        console.error("Create Admin Product Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// Get All Admin Products (Admin Panel - Protected)
const getAllAdminProducts = async (req, res) => {
    try {
        const { search, category_id, status } = req.query;

        let whereClause = { is_deleted: false };

        if (search) {
            whereClause.OR = [
                { product_name: { contains: search, mode: 'insensitive' } },
                { product_title: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (category_id) whereClause.category_id = parseInt(category_id);
        if (status) whereClause.status = status;

        const products = await prisma.products.findMany({
            where: whereClause,
            include: {
                images: true,
                category: true,
                admin: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Public Admin Products (For Users)
const getPublicAdminProducts = async (req, res) => {
    try {
        const products = await prisma.products.findMany({
            where: {
                is_deleted: false,
                status: 'ACTIVE'
            },
            include: {
                images: true,
                category: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Single Admin Product
const getAdminProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.products.findUnique({
            where: { product_id: id },
            include: {
                images: true,
                category: true,
                admin: true
            }
        });

        if (!product || product.is_deleted) return res.status(404).json({ error: "Product not found" });

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Admin Product
const updateAdminProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const existingProduct = await prisma.products.findUnique({
            where: { product_id: id }
        });

        if (!existingProduct) {
            return res.status(404).json({ error: "Product not found" });
        }

        const { product_images, ...rest } = data;
        let updateData = {};

        if (rest.product_name) updateData.product_name = rest.product_name;
        if (rest.product_title) updateData.product_title = rest.product_title;
        if (rest.product_description) updateData.product_description = rest.product_description;
        if (rest.product_guide) updateData.product_guide = rest.product_guide;

        if (rest.product_price) updateData.product_price = parseFloat(rest.product_price);
        if (rest.discount_price !== undefined) updateData.discount_price = rest.discount_price ? parseFloat(rest.discount_price) : null;
        if (rest.category_id) updateData.category_id = parseInt(rest.category_id);

        if (rest.stock !== undefined) updateData.stock = parseInt(rest.stock);
        if (rest.is_featured !== undefined) updateData.is_featured = rest.is_featured;
        if (rest.status) updateData.status = rest.status;

        // Update Scalar Fields
        await prisma.products.update({
            where: { product_id: id },
            data: updateData
        });

        // Handle New Images
        if (product_images) {
            let urls = product_images;
            if (!Array.isArray(urls)) urls = [urls];

            let newImages = [];
            for (let i = 0; i < urls.length; i += 3) {
                const large = urls[i];
                const medium = urls[i + 1];
                const small = urls[i + 2];

                if (large && medium && small) {
                    newImages.push({
                        admin_product_id: id,
                        large_url: String(large),
                        medium_url: String(medium),
                        small_url: String(small)
                    });
                }
            }

            if (newImages.length > 0) {
                await prisma.image.createMany({ data: newImages });
            }
        }

        const finalProduct = await prisma.products.findUnique({
            where: { product_id: id },
            include: { images: true, category: true }
        });

        res.status(200).json({ message: "Product updated", product: finalProduct });
    } catch (error) {
        console.error("Update Admin Product Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// Soft Delete Admin Product
const deleteAdminProduct = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.products.update({
            where: { product_id: id },
            data: { is_deleted: true, status: 'INACTIVE' }
        });

        res.status(200).json({ message: "Product deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createAdminProduct,
    getAllAdminProducts,
    getPublicAdminProducts,
    getAdminProduct,
    updateAdminProduct,
    deleteAdminProduct
};
