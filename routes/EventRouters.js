import express from 'express';
import eventController from '../controllers/eventController.js';



const router = express.Router();


router.post('/', eventController.createEvent);

// Get all events
router.get('/', eventController.retrieveAllEvent);

// Get a single event by id
router.get('/:id', eventController.retrieveEvent);

// Update an event
router.put('/:id', eventController.updateEvent);

// Delete an event
router.delete('/:id', eventController.deleteEvent);

export default router;