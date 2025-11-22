import mongoose from 'mongoose';
import environment from './environment.js';
import logger from '../utils/logger.js';

class Database {
  constructor() {
    this.isConnected = false;
    this.connection = null;
  }

  async connect() {
    try {
      if (this.isConnected) {
        return this.connection;
      }

      const options = {
        autoIndex: environment.NODE_ENV === 'development',
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      this.connection = await mongoose.connect(environment.MONGODB_URI, options);
      this.isConnected = true;

      logger.info('✅ Connected to MongoDB successfully');

      // هندل کردن events دیتابیس
      mongoose.connection.on('error', (error) => {
        logger.error('❌ MongoDB connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('⚠️ MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('🔁 MongoDB reconnected');
        this.isConnected = true;
      });

      return this.connection;

    } catch (error) {
      logger.error('❌ Failed to connect to MongoDB:', error);
      process.exit(1);
    }
  }

  async close() {
    try {
      if (this.isConnected) {
        await mongoose.connection.close();
        this.isConnected = false;
        logger.info('✅ MongoDB connection closed');
      }
    } catch (error) {
      logger.error('❌ Error closing MongoDB connection:', error);
    }
  }

  getStatus() {
    return {
      connected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      models: Object.keys(mongoose.connection.models)
    };
  }
}

export default new Database();
