const Razorpay = require('razorpay');
const crypto = require('crypto');
const prisma = require('../config/prisma');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1. Create Razorpay Order
const createRazorpayOrder = async (req, res) => {
    try {
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({ error: "User ID is required" });
        }

        // Get User's Cart
        const cartItems = await prisma.cart.findMany({
            where: { user_id },
            include: {
                product: true,
                adminProduct: true
            }
        });

        if (cartItems.length === 0) {
            return res.status(400).json({ error: "Cart is empty" });
        }

        // Calculate Total
        let total_amount = 0;
        cartItems.forEach(item => {
            const price = item.product ? item.product.product_price : (item.adminProduct ? item.adminProduct.product_price : 0);
            total_amount += parseFloat(price) * item.quantity;
        });

        // Razorpay expects amount in paise (multiply by 100)
        const options = {
            amount: Math.round(total_amount * 100),
            currency: "INR",
            receipt: `receipt_${Date.now()}_${user_id.substring(0, 5)}`,
        };

        const order = await razorpay.orders.create(options);

        if (!order) {
            return res.status(500).json({ error: "Some error occurred" });
        }

        res.json({
            order,
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// 2. Verify Payment and Create Order in DB
const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            user_id,
            shipping_address // New Field
        } = req.body;

        // Verify Signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // --- Payment Successful Logic ---

            // 1. Fetch Cart Items again (to create order)
            // Ideally we should have locked these, but for now we fetch again.
            const cartItems = await prisma.cart.findMany({
                where: { user_id },
                include: {
                    product: {
                        include: {
                            vendor: true
                        }
                    },
                    adminProduct: true
                }
            });

            if (cartItems.length === 0) {
                // This is an edge case: Payment success but cart empty?
                // Maybe user cleared it in another tab? 
                // We should record the payment anyway but flagging it might be hard.
                // For now, assume cart is still there.
                return res.status(400).json({ error: "Cart not found for order creation." });
            }

            // 2. Calculate totals and Prepare Order Items
            let total_amount = 0;
            const orderItemsData = cartItems.map(item => {
                const isVendorProduct = !!item.product;
                const price = parseFloat(isVendorProduct ? item.product.product_price : item.adminProduct.product_price);
                const quantity = item.quantity;
                total_amount += price * quantity;

                return {
                    product_id: isVendorProduct ? item.product_id : null,
                    admin_product_id: isVendorProduct ? null : item.admin_product_id,
                    vendor_id: isVendorProduct ? item.product.vendor_id : null,
                    price: price,
                    quantity: quantity
                };
            });

            // 3. Transaction: Create Order, Payment, Commissions, Clear Cart
            const result = await prisma.$transaction(async (tx) => {

                // A. Create Order
                const newOrder = await tx.order.create({
                    data: {
                        user_id,
                        total_amount,
                        payment_status: "paid", // CONFIRMED
                        order_status: "pending", // To be processed by admin/vendors
                        shippingAddress: shipping_address ? {
                            create: {
                                address: shipping_address.address,
                                city: shipping_address.city,
                                state: shipping_address.state,
                                pincode: shipping_address.pincode
                            }
                        } : undefined,
                        orderItems: {
                            create: orderItemsData
                        }
                    },
                    include: {
                        orderItems: true
                    }
                });

                // B. Create Payment Record
                await tx.payment.create({
                    data: {
                        order_id: newOrder.order_id,
                        amount: total_amount,
                        payment_method: "razorpay",
                        payment_status: "success",
                        payment_type: "order_payment",
                        transaction_id: razorpay_payment_id
                    }
                });

                // C. Create Commissions (Only for Vendor Products)
                // We need to group items by vendor to calculate specific vendor commissions.
                const vendorMap = new Map();
                orderItemsData.forEach(item => {
                    if (item.vendor_id) { // Only if vendor exists
                        if (!vendorMap.has(item.vendor_id)) {
                            vendorMap.set(item.vendor_id, 0);
                        }
                        vendorMap.set(item.vendor_id, vendorMap.get(item.vendor_id) + (item.price * item.quantity));
                    }
                });

                // We need to fetch vendors to get their commission rates
                const vendorIds = Array.from(vendorMap.keys());
                const vendors = await tx.vendor.findMany({
                    where: {
                        id: { in: vendorIds }
                    }
                });

                const vendorRateMap = new Map();
                vendors.forEach(v => {
                    vendorRateMap.set(v.id, parseFloat(v.commission_rate) || 0.10); // Default 10% if missing
                });

                for (const [vId, vTotal] of vendorMap.entries()) {
                    const rate = vendorRateMap.get(vId);
                    const commAmount = vTotal * rate;

                    await tx.commission.create({
                        data: {
                            vendor_id: vId,
                            order_id: newOrder.order_id,
                            commission_amount: commAmount
                        }
                    });
                }

                // D. Clear Cart
                await tx.cart.deleteMany({
                    where: { user_id }
                });

                return newOrder;
            }, {
                maxWait: 5000, // default: 2000
                timeout: 10000 // default: 5000
            });

            res.json({
                message: "Payment success and Order placed",
                orderId: result.order_id,
                paymentId: razorpay_payment_id
            });

        } else {
            res.status(400).json({
                success: false,
                error: "Invalid Signature"
            });
        }

    } catch (error) {
        console.error("Verify Payment Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// 3. Create Vendor Payout
const createVendorPayout = async (req, res) => {
    try {
        const { vendor_id, amount, payment_method } = req.body;

        if (!vendor_id || !amount) {
            return res.status(400).json({ error: "Vendor ID and Amount required" });
        }

        const payout = await prisma.payment.create({
            data: {
                vendor_id: vendor_id,
                amount: parseFloat(amount),
                payment_method: payment_method || 'manual', // or bank_transfer
                payment_status: 'success', // Assuming manual payout is instant/recorded
                payment_type: 'vendor_payout'
                // order_id is optional now
            }
        });

        res.status(201).json({ message: "Payout recorded successfully", payout });
    } catch (error) {
        console.error("Payout Error:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createRazorpayOrder,
    verifyPayment,
    createVendorPayout
};
