import mongoose from 'mongoose';
import config from '../config/index.js';

const connectDB = async () => {
  try {
    const uri = config.mongoURI;
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};

export default connectDB;
