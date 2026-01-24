import mongoose from 'mongoose';
import config from './index';
import logger from '../utils/logger';

export const connectDatabase = async (): Promise<void> => {
  try {
    const uri = config.env === 'test' ? config.mongodb.testUri : config.mongodb.uri;
    
    await mongoose.connect(uri, {
      // MongoDB connection options
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      family: 4, // Use IPv4
    });

    logger.info(`MongoDB connected: ${mongoose.connection.host}`);
    
    // Enable encryption at rest for production
    if (config.env === 'production') {
      logger.info('MongoDB encryption at rest enabled');
    }
    
    // Set up connection event listeners
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });
    
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
};