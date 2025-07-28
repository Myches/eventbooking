import express from 'express';
import dotenv from 'dotenv';
import passport from './config/passport.js';
import bookingRouter from './routes/BookingRouter.js';
import eventsRouter from './routes/EventRouters.js';
import userRouter from './routes/AuthRouter.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/api/bookings', bookingRouter);
app.use('/api/events', eventsRouter);
app.use('/api/users', userRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server Running on PORT ${port}`);
});
