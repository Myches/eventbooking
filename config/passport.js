import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import db from './db.js';

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};

passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
        try {
            console.log('JWT Payload:', jwt_payload);
            
            const result = await db.query('SELECT id, name, email, role FROM users WHERE id = $1', [jwt_payload.id]);
            
            if (result.rows.length > 0) {
                return done(null, result.rows[0]);
            } else {
                return done(null, false);
            }
        } catch (error) {
            console.error('JWT Strategy error:', error);
            return done(error, false);
        }
    })
);

export default passport;