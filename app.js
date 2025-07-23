import express from 'express';
import bookingRouter from './routes/BookingRouter.js';
import eventsRouter from './routes/EventRouters.js';
import userRouter from './routes/AuthRouter.js';


const app = express();

app.use(express.json());

// Routes
app.use('/api/bookings', bookingRouter);
app.use('/api/events', eventsRouter);
app.use('/api/users', userRouter);

const port = 3000;


app.listen(port , ()=>{
    console.log(`Server Running on PORT ${port}`)
})
