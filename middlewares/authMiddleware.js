const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.cookies.token || req.cookies.user_token || req.cookies.vendor_token;
    console.log(token);
    console.log(req.cookies);
    console.log(req);
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
