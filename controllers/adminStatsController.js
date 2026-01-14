const prisma = require("../config/prisma");

// Get Dashboard Statistics
const getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        // 1. Total Orders Today
        const ordersToday = await prisma.order.count({
            where: {
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        });

        // 2. Total Amount Credited (Total Revenue from Paid/Success orders)
        // Adjust status check based on your payment logic ('paid', 'success', etc.)
        const revenueAgg = await prisma.order.aggregate({
            _sum: {
                total_amount: true
            },
            where: {
                payment_status: { in: ['paid', 'success'] }
            }
        });
        const totalRevenue = revenueAgg._sum.total_amount || 0;

        // 3. Inventory Total Items (Admin + Vendor)
        // Admin products
        const adminProductsCount = await prisma.products.count({
            where: { is_deleted: false }
        });
        // Vendor products
        const vendorProductsCount = await prisma.product.count({
            // Assuming we count all or just available? usually all inventory items.
        });
        const totalInventory = adminProductsCount + vendorProductsCount;

        // 4. Total Users
        const totalUsers = await prisma.user.count();

        // 5. Recent Orders (Last 5)
        const recentOrders = await prisma.order.findMany({
            take: 5,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                user: {
                    select: {
                        username: true,
                        user_email: true
                    }
                }
            }
        });

        res.status(200).json({
            ordersToday,
            totalRevenue,
            totalInventory,
            totalUsers,
            recentOrders
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getDashboardStats
};
