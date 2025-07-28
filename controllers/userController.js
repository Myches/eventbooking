import db from "../config/db.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const saltRounds = 10;
const allowedRoles = ['user', 'admin'];

const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user.id, 
            email: user.email, 
            role: user.role 
        },
        process.env.JWT_SECRET,
        { 
            expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
        }
    );
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
        const token = generateToken(user);

        return res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token,
            roles: allowedRoles 
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'Error while registering user' });
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

        const token = generateToken(user);

        res.status(200).json({
            message: 'Login successful',
            user: { 
                id: user.id, 
                email: user.email, 
                name: user.name, 
                role: user.role 
            },
            token
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database error' });
    }
};

const getProfile = async (req, res) => {
    try {
        // req.user is populated by the JWT middleware
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
    getProfile
};