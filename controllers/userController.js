import db from "../config/db.js";
import bcrypt from 'bcrypt'

const saltRounds = 10;

const register = async (req, res) => {
    const { name, email, password, role } = req.body;
    
    // Fixed the condition check
    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'All input fields required' });
    }

    try {
        // Check if email exists
        const checkEmail = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        
        // Corrected email check logic
        if (checkEmail.rows.length > 0) {
            return res.status(400).json({ error: 'Email is already registered' });
        }

        // Hash password
        bcrypt.hash(password, saltRounds, async (err, hash) => {
            if (err) {
                console.error('Hashing error:', err);
                return res.status(500).json({ error: 'Server error' });
            }

            try {
                // Insert user (don't return password/hash in response)
                const result = await db.query(
                    'INSERT INTO users(name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
                    [name, email, hash, role]
                );

                return res.status(201).json({
                    message: 'User created successfully',
                    user: result.rows[0]
                });
            } catch (error) {
                console.error('Registration error:', error);
                return res.status(500).json({ error: 'Error while registering user' });
            }
        });
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Database error' });
    }
};

const login = async (req,res)=>{
     const { email, loginPassword } = req.body
    if (!email || !loginPassword) {
        return res.status(400).json({ error: 'Email and password are required' })
    }
    try {
 
        const results = await db.query('SELECT * FROM users WHERE email=$1', [email])
        
        if (results.rows.length > 0) {
            const user = results.rows[0]
            const storedHashedPassword = user.password

            bcrypt.compare(loginPassword, storedHashedPassword, (err, results) => {
                if (err) {
                    console.error('Compare error:', err)
                    return res.status(500).json({ error: 'Server error' })
                } else {
                    if (results) {
                        res.status(200).json({
                            message: 'Login successful',
                            user: { id: user.id, email: user.email , name:user.name , role: user.role}
                        })
                    } else {
                        res.status(401).json({ error: 'Incorrect password' })
                    }
                }
            })
        } else {
            res.status(404).json({ error: 'User not found' })
        }
    } catch (err) {
        console.error('Database error:', err)
        res.status(500).json({ error: 'Database error' })
    }
    
}


export default {
    register,login
}