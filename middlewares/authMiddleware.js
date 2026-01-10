const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.cookies.token || req.cookies.user_token || req.cookies.vendor_token;

    if (!token) {
        return res.status(401).json({ error: "Access denied. Not authenticated." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        req.user = decoded;
        next();
    } catch (error) {
        res.clearCookie('token');
        return res.status(401).json({ error: "Invalid token" });
    }
};

module.exports = verifyToken;
