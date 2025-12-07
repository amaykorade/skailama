import dotenv from 'dotenv';

// Load environment variables FIRST before any other imports
dotenv.config();

import express from 'express';
import cors from 'cors';
import config from './src/config/index.js';
import errorHandler from './src/middleware/errorHandler.js';
import connectDB from './src/db/database.js';

// connect to MongoDB (non-blocking)
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err.message);
});

const app = express();

// CORS setup - allow all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false
}));


// body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
import apiRoutes from './src/routes/api.js';
app.use('/api', apiRoutes);

// root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Server is running',
    environment: config.nodeEnv 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// error handler
app.use(errorHandler);

// start server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port} (${config.nodeEnv})`);
});

