import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import connectDB from './configs/db.js';
import 'dotenv/config';
import StudentRouter from './routes/StudentRoute.js';
import VendorRouter from './routes/VendorRoute.js';
import router from './routes/contactRoutes.js';
import scheduleMenuDeletion from './cron/deleteMenus.js';

console.log("Server is starting...");

const app = express();
const port = process.env.PORT || 4000;

await connectDB();

// Configure allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://every-day-meal-main.vercel.app',
  'https://everydaymeal-main.onrender.com'
];

// Configure cookie options
const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

// Middleware
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'));
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Make cookie config available to routes
app.locals.cookieConfig = cookieConfig;

// Basic route
app.get('/', (req, res) => {
  res.send("API is working");
});

app.use('/api/Student', StudentRouter)
app.use('/api/Vendor', VendorRouter)
app.use('/api', router);

scheduleMenuDeletion();

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

