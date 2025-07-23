import db from "../config/db.js"


const createBooking = async (req, res) => {
    const { event_id, user_id } = req.params;
    const { seats_booked, booking_date } = req.body;  
    try {
        /**
         * @swagger
         * /bookings/{event_id}/{user_id}:
         *   post:
         *     summary: Create a new booking
         *     description: Inserts a new booking into the bookings table.
         *     tags:
         *       - Bookings
         *     parameters:
         *       - in: path
         *         name: event_id
         *         required: true
         *         schema:
         *           type: integer
         *         description: ID of the event
         *       - in: path
         *         name: user_id
         *         required: true
         *         schema:
         *           type: integer
         *         description: ID of the user
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             properties:
         *               seats_booked:
         *                 type: integer
         *                 example: 2
         *               booking_date:
         *                 type: string
         *                 format: date
         *                 example: "2024-06-01"
         *     responses:
         *       201:
         *         description: Booking created successfully
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 id:
         *                   type: integer
         *                 seats_booked:
         *                   type: integer
         *                 booking_date:
         *                   type: string
         *                   format: date
         *                 event_id:
         *                   type: integer
         *                 user_id:
         *                   type: integer
         *       500:
         *         description: Error creating booking
         */
        const result = await db.query(
            'INSERT INTO bookings (seats_booked, booking_date, event_id, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [seats_booked, booking_date, event_id, user_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating booking' });
    }
};

// Get all bookings
/**
 * Retrieves all bookings from the database and returns them as a JSON response.
 *
 * @async
 * @function retrieveAllBooking
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with all bookings or an error message.
 */
const retrieveAllBooking = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM bookings');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving bookings' });
    }
};

// Get a single booking from a user for a particular event
const retrieveBooking = async (req, res) => {
    const { booking_id, event_id, user_id } = req.params;
    
    try {
        const result = await db.query(
            'SELECT * FROM bookings WHERE id = $1 AND user_id = $2 AND event_id = $3',
            [booking_id, user_id, event_id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving booking' });
    }
};

// Update a booking for a user for a particular event
const updateBooking = async (req, res) => {
    const { booking_id, event_id, user_id } = req.params;
    const { seats_booked, booking_date } = req.body;
    
    try {
        const result = await db.query(
            'UPDATE bookings SET seats_booked = $1, booking_date = $2 WHERE id = $3 AND event_id = $4 AND user_id = $5 RETURNING *',
            [seats_booked, booking_date, booking_id, event_id, user_id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating booking' });
    }
};

// Delete a booking
const deleteBooking = async (req, res) => {
    const { booking_id, event_id, user_id } = req.params;
    
    try {
        const result = await db.query(
            'DELETE FROM bookings WHERE id = $1 AND event_id = $2 AND user_id = $3 RETURNING *',
            [booking_id, event_id, user_id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        res.status(200).json({ message: 'Booking deleted successfully', booking: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting booking' });
    }
};

export default {
    createBooking,
    retrieveAllBooking,
    retrieveBooking,
    updateBooking,
    deleteBooking
};