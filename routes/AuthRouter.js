import express from 'express';
import userController from '../controllers/userController.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
router.get('/profile', authenticateJWT, userController.getProfile);

// Admin only route example
router.get('/admin-only', authenticateJWT, requireRole(['admin']), (req, res) => {
    res.json({ message: 'Admin access granted', user: req.user });
});

export default router;
