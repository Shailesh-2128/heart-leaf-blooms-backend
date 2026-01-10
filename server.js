const express = require("express");
const app = express();
require("dotenv").config();
const vendorRoute = require("./routes/vendorRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes"); // Import user routes
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const compression = require("compression");
const PORT = process.env.PORT;
const cors = require("cors");


const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(cors({ origin: true, credentials: true })); // origin: true allows the requesting origin, needed for cookies
app.use(compression());

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.get("/", (req, res) => {

    res.send("blooms server is running");
});

app.use("/vendor", vendorRoute);
app.use("/admin", adminRoutes);
app.use("/user", userRoutes); // Use user routes
app.use("/product", productRoutes);
app.use("/category", categoryRoutes);
app.use("/order", orderRoutes);
app.use("/cart", cartRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/payment", paymentRoutes);

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
})