import express from 'express';
import eventController from '../controllers/eventController.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const router = express.Router();
const ROLES = { USER: 'user', ADMIN: 'admin' };

// Public routes (no authentication required)
// Get all events - anyone can view events
router.get('/', eventController.retrieveAllEvent);

// Get a single event by id - anyone can view individual events
router.get('/:id', eventController.retrieveEvent);

// Search for events - anyone can search events
// NOTE: Move this BEFORE /:id route to avoid conflicts
router.get('/search', eventController.searchEvents);

// Apply authentication to all routes below this point
router.use(authenticateJWT);

// Create event - ADMIN ONLY
// Only admins can create new events
router.post('/', requireRole([ROLES.ADMIN]), eventController.createEvent);

// Update an event - ADMIN ONLY
// Only admins can modify events
router.put('/:id', requireRole([ROLES.ADMIN]), eventController.updateEvent);

// Delete an event - ADMIN ONLY
// Only admins can delete events
router.delete('/:id', requireRole([ROLES.ADMIN]), eventController.deleteEvent);


export default router;
