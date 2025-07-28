import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import db from './db.js';

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6' 
};

passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
        try {
            // Log the payload for debugging
            console.log('JWT Payload:', jwt_payload);

            // Query the database for the user
            const result = await db.query('SELECT id, name, email, role FROM users WHERE id = $1', [jwt_payload.id]);

            if (result.rows.length > 0) {
                return done(null, result.rows[0]);
            } else {
                return done(null, false); // User not found
            }
        } catch (error) {
            console.error('JWT Strategy error:', error);
            return done(error, false);
        }
    })
);

export default passport;