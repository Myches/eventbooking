

// controllers/authController.js
import db from "../config/db.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const saltRounds = 10;
const allowedRoles = ['user', 'admin'];

// Generate access token (short-lived)
const generateAccessToken = (user) => {
    return jwt.sign(
        { 
            id: user.id, 
            email: user.email, 
            role: user.role 
        },
        process.env.JWT_SECRET,
        { 
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' // Short-lived
        }
    );
};

// Generate refresh token (long-lived)
const generateRefreshToken = () => {
    return crypto.randomBytes(64).toString('hex');
};

// Store refresh token in database
const storeRefreshToken = async (userId, refreshToken) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
    
    try {
        // Delete any existing refresh tokens for this user
        await db.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
        
        // Store new refresh token
        await db.query(
            'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
            [userId, refreshToken, expiresAt]
        );
    } catch (error) {
        console.error('Error storing refresh token:', error);
        throw error;
    }
};

// Validate refresh token
const validateRefreshToken = async (token) => {
    try {
        const result = await db.query(
            `SELECT rt.*, u.id, u.name, u.email, u.role 
             FROM refresh_tokens rt 
             JOIN users u ON rt.user_id = u.id 
             WHERE rt.token = $1 AND rt.expires_at > NOW()`,
            [token]
        );
        
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error('Error validating refresh token:', error);
        throw error;
    }
};

// Delete refresh token
const deleteRefreshToken = async (token) => {
    try {
        await db.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
    } catch (error) {
        console.error('Error deleting refresh token:', error);
        throw error;
    }
};

const register = async (req, res) => {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'All input fields required' });
    }

    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role selected' });
    }

    try {
        const checkEmail = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (checkEmail.rows.length > 0) {
            return res.status(400).json({ error: 'Email is already registered' });
        }

        const hash = await bcrypt.hash(password, saltRounds);
        
        const result = await db.query(
            'INSERT INTO users(name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, hash, role]
        );

        const user = result.rows[0];
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken();
        
        // Store refresh token in database
        await storeRefreshToken(user.id, refreshToken);

        return res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            accessToken,
            refreshToken,
            roles: allowedRoles 
        });
    } catch (err) {
        console.error('Register error details:', {
            error: err,
            timestamp: new Date(),
            emailAttempted: email
        });
        res.status(500).json({ error: 'Database error' });
    }
};

const login = async (req, res) => {
    const { email, loginPassword } = req.body;
    
    if (!email || !loginPassword) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    
    try {
        const results = await db.query('SELECT * FROM users WHERE email=$1', [email]);
        
        if (results.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = results.rows[0];
        
        const isValidPassword = await bcrypt.compare(loginPassword, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Incorrect password' });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken();
        
        // Store refresh token in database
        await storeRefreshToken(user.id, refreshToken);

        res.status(200).json({
            message: 'Login successful',
            user: { 
                id: user.id, 
                email: user.email, 
                name: user.name, 
                role: user.role 
            },
            accessToken,
            refreshToken
        });
    } catch (err) {
        console.error('Login error details:', {
            error: err,
            timestamp: new Date(),
            emailAttempted: email
        });
        res.status(500).json({ error: 'Database error' });
    }
};

// New refresh token endpoint
const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token is required' });
    }
    
    try {
        // Validate refresh token
        const tokenData = await validateRefreshToken(refreshToken);
        
        if (!tokenData) {
            return res.status(403).json({ error: 'Invalid or expired refresh token' });
        }
        
        // Generate new access token
        const user = {
            id: tokenData.id,
            email: tokenData.email,
            role: tokenData.role
        };
        
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken();
        
        // Delete old refresh token and store new one
        await deleteRefreshToken(refreshToken);
        await storeRefreshToken(user.id, newRefreshToken);
        
        res.status(200).json({
            message: 'Token refreshed successfully',
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
        
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Logout endpoint to invalidate refresh token
const logout = async (req, res) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
    }
    
    try {
        await deleteRefreshToken(refreshToken);
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getProfile = async (req, res) => {
    try {
        res.status(200).json({
            message: 'Profile retrieved successfully',
            user: req.user
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export default {
    register,
    login,
    refreshToken,
    logout,
    getProfile
};
