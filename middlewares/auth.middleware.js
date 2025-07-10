const jwt = require('jsonwebtoken');
require('dotenv').config()
const acl = require('./acl.middleware');
const authorize = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.SECRET);
        console.log("Decoded Token:", decoded); // Debugging line
        
        const userRole = decoded.role.toLowerCase();
		console.log("🔐 Checking role:", userRole);
		console.log("🔐 Path:", req.route.path);
		console.log("🔐 Method:", req.method.toLowerCase());

		const resourcePath = req.baseUrl + req.route.path;
		console.log("🔐 Full resource path:", resourcePath);

		acl.areAnyRolesAllowed(userRole, resourcePath, req.method.toLowerCase(), (err, result) => {
        // acl.areAnyRolesAllowed(userRole, req.route.path, req.method.toLowerCase(), (err, result) => {
            if (err) {
                console.log('Authorization error:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }
            if (result) {
                next();
            } else {
                return res.status(403).json({ message: 'Forbidden: You do not have permission to access this resource.' });
            }
        });
    } catch (error) {
        console.log('Token verification error:', error);
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};
module.exports = {authorize};