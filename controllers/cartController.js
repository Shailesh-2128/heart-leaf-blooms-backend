const prisma = require("../config/prisma");

// Add to Cart
const addToCart = async (req, res) => {
    try {
        const { id } = req.params; // user_id
        const { product_id, quantity } = req.body;

        // Determine if it is a Vendor Product or Admin Product
        const vendorProduct = await prisma.product.findUnique({ where: { product_id } });
        const adminProduct = !vendorProduct ? await prisma.products.findUnique({ where: { product_id } }) : null;

        if (!vendorProduct && !adminProduct) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Check if item already exists
        const existingItem = await prisma.cart.findFirst({
            where: {
                user_id: id,
                OR: [
                    { product_id: vendorProduct ? product_id : undefined },
                    { admin_product_id: adminProduct ? product_id : undefined }
                ]
            }
        });

        if (existingItem) {
            // Update quantity
            const updatedItem = await prisma.cart.update({
                where: { cart_id: existingItem.cart_id },
                data: { quantity: existingItem.quantity + parseInt(quantity) }
            });
            return res.status(200).json({ message: "Cart updated", item: updatedItem });
        }

        const newItem = await prisma.cart.create({
            data: {
                user_id: id,
                product_id: vendorProduct ? product_id : null,
                admin_product_id: adminProduct ? product_id : null,
                quantity: parseInt(quantity)
            }
        });

        res.status(201).json({ message: "Added to cart", item: newItem });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Cart Item
const updateCartItem = async (req, res) => {
    try {
        const { id, cartId } = req.params; // user_id, cart_id
        const { quantity } = req.body;

        const updatedItem = await prisma.cart.update({
            where: { cart_id: parseInt(cartId) },
            data: { quantity: parseInt(quantity) },
            include: { product: { include: { images: true } } }
        });

        res.status(200).json({ message: "Cart item updated", item: updatedItem });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete Cart Item
const deleteCartItem = async (req, res) => {
    try {
        const { id, cartId } = req.params; // user_id, cart_id 

        // Ideally verify cart item belongs to user
        const cartItem = await prisma.cart.findUnique({
            where: { cart_id: parseInt(cartId) }
        });

        if (!cartItem || cartItem.user_id !== id) {
            return res.status(404).json({ error: "Cart item not found or unauthorized" });
        }

        await prisma.cart.delete({
            where: { cart_id: parseInt(cartId) }
        });

        res.status(200).json({ message: "Cart item removed" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    addToCart,
    updateCartItem,
    deleteCartItem
};
