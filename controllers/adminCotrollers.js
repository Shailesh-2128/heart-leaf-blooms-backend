const prisma = require("../config/prisma");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const createAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Generate 6 length ID
        const id = uuidv4().substring(0, 6);

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = await prisma.admin.create({
            data: {
                id,
                name,
                email,
                password: hashedPassword
            }
        });

        res.status(201).json({ message: "Admin created successfully", admin: newAdmin });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await prisma.admin.findUnique({
            where: { email }
        });

        if (!admin) {
            return res.status(404).json({ error: "Admin not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.status(200).json({ message: "Login successful", token, admin });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const logoutAdmin = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
    });
    res.status(200).json({ message: "Logged out successfully" });
};

const displayAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const admin = await prisma.admin.findUnique({
            where: { id }
        });

        if (!admin) {
            return res.status(404).json({ error: "Admin not found" });
        }

        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, password } = req.body;

        let updateData = {};

        if (email) {
            updateData.email = email;
        }

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: "No fields to update provided" });
        }

        const updatedAdmin = await prisma.admin.update({
            where: { id },
            data: updateData
        });

        res.status(200).json({ message: "Admin updated successfully", admin: updatedAdmin });

    } catch (error) {
        if (error.code === 'P2002') { // Unique constraint failed
            return res.status(400).json({ error: "Email already exists" });
        }
        if (error.code === 'P2025') { // Record not found
            return res.status(404).json({ error: "Admin not found" });
        }
        res.status(500).json({ error: error.message });
    }
};

const getVendorPayoutStats = async (req, res) => {
    try {
        const vendors = await prisma.vendor.findMany({
            where: { status: 'approved' } // Only approved vendors
        });

        const stats = [];

        for (const vendor of vendors) {
            // 1. Total Sales (from OrderItems in paid orders)
            // Ideally we should filter by payment_status of the order.
            // For simplicity, we assume if OrderItem exists in Order w/ paid status.
            const salesAgg = await prisma.orderItem.aggregate({
                _sum: {
                    price: true // We can't multiply in aggregate easily without raw query or iterating
                },
                where: {
                    vendor_id: vendor.id,
                    order: {
                        payment_status: 'paid' // or success
                    }
                }
            });

            // Note: aggregate _sum price gives total price, but we need price * quantity.
            // Prisma doesn't support multiplying cols in aggregate yet easily.
            // We have to fetch or use raw query. Let's fetch for accuracy.
            const items = await prisma.orderItem.findMany({
                where: {
                    vendor_id: vendor.id,
                    order: {
                        OR: [
                            { payment_status: 'paid' },
                            { payment_status: 'success' }
                        ]
                    }
                },
                select: { price: true, quantity: true }
            });

            const totalSales = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

            // 2. Total Commission
            const commAgg = await prisma.commission.aggregate({
                _sum: {
                    commission_amount: true
                },
                where: {
                    vendor_id: vendor.id
                }
            });
            const totalCommission = parseFloat(commAgg._sum.commission_amount || 0);

            // 3. Total Paid Out
            const paidAgg = await prisma.payment.aggregate({
                _sum: {
                    amount: true
                },
                where: {
                    vendor_id: vendor.id,
                    payment_type: 'vendor_payout'
                }
            });
            const totalPaid = parseFloat(paidAgg._sum.amount || 0);

            const balance = totalSales - totalCommission - totalPaid;

            stats.push({
                vendor,
                totalSales: totalSales,
                totalCommission: totalCommission,
                totalPaid: totalPaid,
                balance: balance
            });
        }

        res.status(200).json(stats);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const listVendors = async (req, res) => {
    try {
        const vendors = await prisma.vendor.findMany();
        res.status(200).json(vendors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createAdmin,
    loginAdmin,
    logoutAdmin,
    displayAdmin,
    updateAdmin,
    getVendorPayoutStats,
    listVendors
};
