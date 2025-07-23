import express from 'express';
import bookingController from '../controllers/bookingController.js';


const router = express.Router();


// Create booking for an event for a user
router.post('/:event_id/users/:user_id', bookingController.createBooking);

// Get all bookings
router.get('/', bookingController.retrieveAllBooking);

// Get a single booking
router.get('/:event_id/users/:user_id/:booking_id', bookingController.retrieveBooking);

// Update a booking
router.put('/:event_id/users/:user_id/:booking_id', bookingController.updateBooking);

// Delete a booking
router.delete('/:event_id/users/:user_id/:booking_id', bookingController.deleteBooking);

export default router;