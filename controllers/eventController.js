import db from "../config/db.js"


// Create an event
const createEvent = async (req, res) => {
    const { title, description, date, location, total_seats, available_seats } = req.body;
    
    try {
        const result = await db.query(
            'INSERT INTO events (title, description, date, location, total_seats, available_seats) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [title, description, date, location, total_seats, available_seats]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating event' });
    }
};

// Get all events
const retrieveAllEvent = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM events');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving events' });
    }
};

// Get a single event by id
const retrieveEvent = async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await db.query('SELECT * FROM events WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving event' });
    }
};

// Update an event
const updateEvent = async (req, res) => {
    const { id } = req.params;
    const { title, description, date, location, total_seats, available_seats } = req.body;
    
    try {
        const result = await db.query(
            'UPDATE events SET title = $1, description = $2, date = $3, location = $4, total_seats = $5, available_seats = $6 WHERE id = $7 RETURNING *',
            [title, description, date, location, total_seats, available_seats, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating event' });
    }
};

// Delete an event
const deleteEvent = async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await db.query('DELETE FROM events WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        res.status(200).json({ 
            message: 'Event deleted successfully', 
            event: result.rows[0] 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting event' });
    }
};

export default {
    createEvent,
    retrieveAllEvent,
    retrieveEvent,
    updateEvent,
    deleteEvent
};