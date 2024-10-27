const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    // Extract the token from the Authorization header
    const token = req.headers['authorization']?.split(' ')[1]; // e.g., "Bearer <token>"

    // If no token is found, respond with 401
    if (!token) return res.status(401).json({ error: 'User not authenticated.' });

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'User not authorized.' }); // Forbidden
        req.user = user; // Save the user data to request
        next();
    });
};

module.exports = authenticateToken;
