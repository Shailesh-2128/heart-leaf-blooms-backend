const prisma = require("../config/prisma");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Create Vendor (Apply)
const createVendor = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            shopName,
            shopAddress,
            shopDescription,
            bankName,
            IFSC,
            accountNumber
        } = req.body;

        // Check if email already exists
        const existingVendor = await prisma.vendor.findUnique({
            where: { email }
        });

        if (existingVendor) {
            return res.status(400).json({ error: "Email already exists" });
        }

        // Generate 8 char ID
        const id = uuidv4().substring(0, 8);
        const hashedPassword = await bcrypt.hash(password, 10);

        const newVendor = await prisma.vendor.create({
            data: {
                id,
                name,
                email,
                password: hashedPassword,
                shopName,
                shopAddress,
                shopDescription,
                bankName,
                IFSC,
                accountNumber,
                status: "pending" // Default
            }
        });

        res.status(201).json({ message: "Vendor application submitted successfully", vendorId: newVendor.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Login Vendor
const loginVendor = async (req, res) => {
    try {
        const { vendorId, password } = req.body;

        const vendor = await prisma.vendor.findUnique({
            where: { id: vendorId }
        });

        if (!vendor) {
            return res.status(404).json({ error: "Vendor not found" });
        }

        if (vendor.status !== "approved" && vendor.status !== "active") {
            // Assuming "approved" or "active" are valid statuses. 
            // User said: "when admin conforms the vendor will get vendor id".
            // If they try to login before approval, maybe block them?
            // But existing ID is required for login. So they effectively can't login if they don't have the ID.
            // But if they have it (e.g. from response), we should check status.
            if (vendor.status === "pending") {
                return res.status(403).json({ error: "Account is pending approval" });
            }
        }

        const isPasswordValid = await bcrypt.compare(password, vendor.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ id: vendor.id, role: 'vendor' }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.status(200).json({ message: "Login successful", token, vendor });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Logout Vendor
const logoutVendor = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
    });
    res.status(200).json({ message: "Logged out successfully" });
};

// Get All Vendors (for Admin)
const getAllVendors = async (req, res) => {
    try {
        const vendors = await prisma.vendor.findMany();
        res.status(200).json(vendors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Public Vendors (for Frontend)
const getPublicVendors = async (req, res) => {
    try {
        const vendors = await prisma.vendor.findMany({
            where: { status: 'approved' },
            select: {
                id: true,
                shopName: true,
                shopDescription: true,
                shopAddress: true,
                vendorTag: true,
                isFeatured: true,
                isVerified: true
            }
        });
        res.status(200).json(vendors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Single Vendor
const getVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const vendor = await prisma.vendor.findUnique({
            where: { id }
        });

        if (!vendor) {
            return res.status(404).json({ error: "Vendor not found" });
        }

        res.status(200).json(vendor);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Vendor (General Update)
const updateVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // Prevent updating ID or critical fields if needed, but for now allow generic updates
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        const updatedVendor = await prisma.vendor.update({
            where: { id },
            data: data
        });

        res.status(200).json({ message: "Vendor updated successfully", vendor: updatedVendor });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete Vendor
const deleteVendor = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.vendor.delete({
            where: { id }
        });
        res.status(200).json({ message: "Vendor deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin Approve Vendor
const approveVendor = async (req, res) => {
    try {
        const { id } = req.params; // admin passes vendor id
        const { vendorTag, isFeatured, isVerified, status, commission_rate } = req.body;

        const data = {};
        if (vendorTag !== undefined) data.vendorTag = vendorTag;
        if (isFeatured !== undefined) data.isFeatured = isFeatured;
        if (isVerified !== undefined) data.isVerified = isVerified;
        if (commission_rate !== undefined) data.commission_rate = commission_rate;
        if (status !== undefined) data.status = status;
        else data.status = "approved"; // Default to approved if calling this endpoint

        const updatedVendor = await prisma.vendor.update({
            where: { id },
            data: data
        });

        res.status(200).json({ message: "Vendor approved/updated successfully", vendor: updatedVendor });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createVendor,
    loginVendor,
    logoutVendor,
    getAllVendors,
    getVendor,
    updateVendor,
    deleteVendor,
    approveVendor,
    getPublicVendors
};
