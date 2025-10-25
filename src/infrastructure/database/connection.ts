import mongoose from 'mongoose';
import config from '../config/config';

/**
 * Connect to MongoDB database
 */
export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error}`);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB database
 */
export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
  } catch (error) {
    console.error(`Error disconnecting from MongoDB: ${error}`);
  }
};