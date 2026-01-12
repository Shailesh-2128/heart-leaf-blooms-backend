const prisma = require("../config/prisma");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Create User (Register)
const createUser = async (req, res) => {
    try {
        const { username, user_email, user_password, user_address } = req.body; // user_address can be an object or array of objects

        const existingUser = await prisma.user.findUnique({
            where: { user_email }
        });

        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(user_password, 10);
        const user_id = uuidv4();

        // Prepare address data if provided
        let addressData = [];
        if (user_address) {
            if (Array.isArray(user_address)) {
                addressData = user_address;
            } else {
                addressData.push(user_address);
            }
        }

        const newUser = await prisma.user.create({
            data: {
                user_id,
                username,
                user_email,
                user_password: hashedPassword,
                addresses: {
                    create: addressData
                }
            },
            include: {
                addresses: true
            }
        });

        res.status(201).json({ message: "User created successfully", user: newUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Login User
const loginUser = async (req, res) => {
    try {
        const { user_email, user_password } = req.body;

        const user = await prisma.user.findUnique({
            where: { user_email }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(user_password, user.user_password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const user_token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1d' });
        console.log('User Login Token:', user_token);

        res.cookie('user_token', user_token, {
            httpOnly: true,
            secure: false, // Set to true in production if using HTTPS
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.status(200).json({ message: "Login successful", token: user_token, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Logout User
const logoutUser = (req, res) => {
    res.clearCookie('user_token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
    });
    res.status(200).json({ message: "Logged out successfully" });
};

// Get User Profile
const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { user_id: id },
            include: {
                addresses: true,
                cart: {
                    include: {
                        product: {
                            include: {
                                images: true
                            }
                        }
                    }
                },
                wishlist: {
                    include: {
                        product: {
                            include: {
                                images: true
                            }
                        }
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update User
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, user_password } = req.body;

        const data = {};
        if (username) data.username = username;
        if (user_password) data.user_password = await bcrypt.hash(user_password, 10);

        const updatedUser = await prisma.user.update({
            where: { user_id: id },
            data: data
        });

        res.status(200).json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete User
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Manual cleanup to be safe
        await prisma.address.deleteMany({ where: { user_id: id } });
        await prisma.cart.deleteMany({ where: { user_id: id } });
        await prisma.wishlist.deleteMany({ where: { user_id: id } });

        await prisma.user.delete({
            where: { user_id: id }
        });

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add Address
const addAddress = async (req, res) => {
    try {
        const { id } = req.params; // user_id
        const { address, city, state, pincode } = req.body;

        const newAddress = await prisma.address.create({
            data: {
                user_id: id,
                address,
                city,
                state,
                pincode
            }
        });

        res.status(201).json({ message: "Address added", address: newAddress });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get All Users (Admin)
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                addresses: true,
                cart: true,
                wishlist: true
            }
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createUser,
    loginUser,
    logoutUser,
    getUser,
    updateUser,
    deleteUser,
    addAddress,
    getAllUsers
};
