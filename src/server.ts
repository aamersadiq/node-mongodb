import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './infrastructure/database/connection';
import { setupSwagger } from './api/swagger/swagger';
import accountRoutes from './api/routes/accountRoutes';
import transactionRoutes from './api/routes/transactionRoutes';
import { errorHandler, notFoundHandler } from './api/middleware/errorHandler';
import config from './infrastructure/config/config';

/**
 * Express application
 */
const app = express();

/**
 * Middleware
 */
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

/**
 * Routes
 */
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);

/**
 * Swagger documentation
 */
setupSwagger(app);

/**
 * Error handling
 */
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Server
 */
const PORT = config.port || 3000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();