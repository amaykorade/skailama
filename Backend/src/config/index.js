import dotenv from 'dotenv';

// Load env vars when config is imported
dotenv.config();

const mongoURI = process.env.MONGODB_URI?.trim() || 'mongodb://localhost:27017/eventmanagement';

export default {
  port: process.env.PORT || 5001,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoURI: mongoURI,
  cors: {
    origin: process.env.CORS_ORIGIN || '*'
  }
};

