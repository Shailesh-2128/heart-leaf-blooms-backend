const prisma = require("../config/prisma");

// Create Review
const createReview = async (req, res) => {
    try {
        const { user_id, product_id, admin_product_id, rating, review } = req.body;

        if (!user_id || (!product_id && !admin_product_id) || !rating) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newReview = await prisma.review.create({
            data: {
                user_id,
                product_id: product_id || null,
                admin_product_id: admin_product_id || null,
                rating: parseInt(rating),
                review
            }
        });

        // Optional: Update average rating logic here if needed (e.g., in Product model)

        res.status(201).json({ message: "Review added", review: newReview });

    } catch (error) {
        console.error("Create Review Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// Get Reviews by Product
const getTermsReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        // Check both vendor and admin products
        const reviews = await prisma.review.findMany({
            where: {
                OR: [
                    { product_id: productId },
                    { admin_product_id: productId }
                ]
            },
            include: {
                user: {
                    select: {
                        username: true
                        // profile_image? if exists
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get All Reviews (Admin)
const getAllReviews = async (req, res) => {
    try {
        const reviews = await prisma.review.findMany({
            include: {
                user: {
                    select: {
                        username: true,
                        user_email: true
                    }
                },
                product: {
                    select: {
                        product_name: true,
                        product_title: true
                    }
                },
                adminProduct: {
                    select: {
                        product_name: true,
                        product_title: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createReview,
    getTermsReviews,
    getAllReviews
};
