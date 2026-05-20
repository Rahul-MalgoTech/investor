import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { env } from './env.js';
import { logger } from '../utils/logger.js';

let memoryServer;

export async function connectMongo() {
  mongoose.set('strictQuery', true);

  try {
    await connect(env.mongoUri);
  } catch (error) {
    if (env.nodeEnv === 'production') {
      throw error;
    }

    logger.warn(
      `MongoDB unavailable at ${env.mongoUri}. Starting temporary development MongoDB.`,
    );
    memoryServer = await MongoMemoryServer.create();
    await connect(memoryServer.getUri());
  }
}

async function connect(uri) {
  await mongoose.connect(uri, {
    autoIndex: env.nodeEnv !== 'production',
    serverSelectionTimeoutMS: 5000,
  });

  logger.info(`MongoDB connected: ${uri}`);
}
