const prisma = require("../config/prisma");

// Get Unified Inventory (Admin Products + Vendor Products)
const getInventory = async (req, res) => {
    try {
        // 1. Fetch Admin Products
        const adminProducts = await prisma.products.findMany({
            where: { is_deleted: false },
            select: {
                product_id: true,
                product_name: true,
                product_title: true,
                product_price: true,
                stock: true,
                status: true,
                admin: { select: { name: true } },
                images: { take: 1, select: { small_url: true } }
            }
        });

        // 2. Fetch Vendor Products
        const vendorProducts = await prisma.product.findMany({
            select: {
                product_id: true,
                product_name: true,
                product_title: true,
                product_price: true,
                is_available: true,
                vendor: { select: { name: true, shopName: true } },
                images: { take: 1, select: { small_url: true } }
            }
        });

        // 3. Normalize & Merge
        const inventory = [];

        // Map Admin Products
        adminProducts.forEach(p => {
            inventory.push({
                id: p.product_id,
                name: p.product_name,
                title: p.product_title,
                price: parseFloat(p.product_price),
                stock: p.stock,
                status: p.status, // ACTIVE, INACTIVE, DRAFT, OUT_OF_STOCK
                owner_type: 'Admin',
                owner_name: p.admin ? p.admin.name : 'Admin',
                image: p.images[0] ? p.images[0].small_url : null,
                inventory_status: p.stock > 0 ? 'In Stock' : 'Out of Stock'
            });
        });

        // Map Vendor Products
        vendorProducts.forEach(p => {
            inventory.push({
                id: p.product_id,
                name: p.product_name,
                title: p.product_title,
                price: parseFloat(p.product_price),
                stock: null, // Vendor products don't track integer stock in this schema
                status: p.is_available ? 'ACTIVE' : 'INACTIVE',
                owner_type: 'Vendor',
                owner_name: p.vendor ? `${p.vendor.name} (${p.vendor.shopName})` : 'Vendor',
                image: p.images[0] ? p.images[0].small_url : null,
                inventory_status: p.is_available ? 'Available' : 'Unavailable'
            });
        });

        res.status(200).json(inventory);

    } catch (error) {
        console.error("Get Inventory Error:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getInventory
};
