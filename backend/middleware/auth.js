const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!token) return res.status(401).json({ error: 'Access token required' });

    if (!process.env.JWT_SECRET) {
        console.error('❌ JWT_SECRET is not set.');
        return res.status(500).json({ error: 'Server misconfiguration' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user;
        next();
    });
}

module.exports = { authenticateToken };