import { app } from './app.js';
import { env } from './config/env.js';
import { connectMongo } from './config/db.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  await connectMongo();

  app.listen(env.port, () => {
    logger.info(`Investor backend running on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  logger.error('Failed to start backend', error);
  process.exit(1);
});
