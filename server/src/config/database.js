const mongoose = require('mongoose');
const env = require('./env');
const logger = require('./logger');

/**
 * Connect to MongoDB using the configuration defined in env.
 * The connection is reused across the application.
 */
const connectDatabase = async () => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(env.mongodbUri, {
      dbName: env.mongodbName,
    });
    logger.info('✅ Connected to MongoDB');
  } catch (error) {
    logger.error('❌ MongoDB connection error', { error });
    throw error;
  }
};

module.exports = connectDatabase;
