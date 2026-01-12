const requestLogger = (req, res, next) => {
    console.log(`\n[${new Date().toISOString()}] Incoming Request: ${req.method} ${req.url}`);

    // Log Authorization Header
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        // Mask part of the token for security in logs, optional but good practice. 
        // For debugging 401, strict presence is most important.
        console.log(` > Auth Header: ${authHeader.substring(0, 20)}...`);
    } else {
        console.log(' > Auth Header: MISSING');
    }

    // Log Cookies
    if (req.cookies && Object.keys(req.cookies).length > 0) {
        console.log(' > Cookies:', JSON.stringify(req.cookies));
    } else {
        console.log(' > Cookies: NONE');
    }

    next();
};

module.exports = requestLogger;
