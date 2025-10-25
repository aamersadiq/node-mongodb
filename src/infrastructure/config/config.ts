import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Application configuration
 */
export default {
  port: process.env.PORT || 3000,
  mongoURI: process.env.MONGO_URI || 'mongodb://admin:password@localhost:27017/banking?authSource=admin',
  nodeEnv: process.env.NODE_ENV || 'development',
};