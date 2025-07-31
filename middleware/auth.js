import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';

export const authenticateJWT = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(500).json({ error: 'Authentication error' });
        }
        
        if (!user) {
            // Check if token is expired
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.substring(7);
                try {
                    jwt.verify(token, process.env.JWT_SECRET);
                } catch (error) {
                    if (error.name === 'TokenExpiredError') {
                        return res.status(401).json({ 
                            error: 'Token expired',
                            code: 'TOKEN_EXPIRED'
                        });
                    }
                }
            }
            return res.status(401).json({ error: 'Unauthorized access' });
        }
        
        req.user = user;
        next();
    })(req, res, next);
};

export const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized access' });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        
        next();
    };
};