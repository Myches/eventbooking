import express from 'express';
import bookingController from '../controllers/bookingController.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const router = express.Router();
const ROLES = { USER: 'user', ADMIN: 'admin' };

// Apply authentication to all routes
router.use(authenticateJWT);

// Middleware to validate user access for bookings
const validateBookingAccess = (req, res, next) => {
    // Admins can access any user's bookings
    if (req.user.role === ROLES.ADMIN) {
        return next();
    }
    
    // Regular users can only access their own bookings
    const requestedUserId = parseInt(req.params.user_id);
    const currentUserId = req.user.id;
    
    if (requestedUserId !== currentUserId) {
        return res.status(403).json({ 
            error: 'Access denied. You can only access your own bookings.',
            allowedUserId: currentUserId,
            requestedUserId: requestedUserId
        });
    }
    
    next();
};

// Create booking for an event for a user
// Users can only create bookings for themselves, admins can create for anyone
router.post('/:event_id/users/:user_id', validateBookingAccess, bookingController.createBooking);

// Get all bookings
// Users see only their bookings, admins see all bookings
router.get('/', bookingController.retrieveAllBooking);

// Get a single booking
// Users can only access their own bookings, admins can access any booking
router.get('/:event_id/users/:user_id/:booking_id', validateBookingAccess, bookingController.retrieveBooking);

// Update a booking
// Users can only update their own bookings, admins can update any booking
router.put('/:event_id/users/:user_id/:booking_id', validateBookingAccess, bookingController.updateBooking);

// Delete a booking - ADMIN ONLY (permanent deletion)
// Only admins can permanently delete bookings
router.delete('/:event_id/users/:user_id/:booking_id', 
    requireRole([ROLES.ADMIN]), 
    bookingController.deleteBooking
);





export default router;