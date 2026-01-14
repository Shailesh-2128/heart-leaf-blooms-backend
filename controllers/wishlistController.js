const prisma = require("../config/prisma");

// Add to Wishlist
const addToWishlist = async (req, res) => {
    try {
        const { id } = req.params; // user_id
        const { product_id } = req.body;

        // Determine if it is a Vendor Product or Admin Product
        const vendorProduct = await prisma.product.findUnique({ where: { product_id } });
        const adminProduct = !vendorProduct ? await prisma.products.findUnique({ where: { product_id } }) : null;

        if (!vendorProduct && !adminProduct) {
            return res.status(404).json({ error: "Product not found" });
        }

        const newItem = await prisma.wishlist.create({
            data: {
                user_id: id,
                product_id: vendorProduct ? product_id : null,
                admin_product_id: adminProduct ? product_id : null
            }
        });

        res.status(201).json({ message: "Added to wishlist", item: newItem });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Remove from Wishlist
const deleteWishlistItem = async (req, res) => {
    try {
        const { wishlistId } = req.params;

        await prisma.wishlist.delete({
            where: { wishlist_id: parseInt(wishlistId) }
        });

        res.status(200).json({ message: "Removed from wishlist" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    addToWishlist,
    deleteWishlistItem
};
