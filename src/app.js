import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { env } from './config/env.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { authRouter } from './routes/auth.routes.js';
import { homeContentRouter } from './routes/homeContent.routes.js';
import { profileRouter } from './routes/profile.routes.js';
import { uploadRouter } from './routes/upload.routes.js';

export const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigins.length > 0 ? env.corsOrigins : true,
    credentials: true,
  }),
);
app.use(express.json({ limit: '25mb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(apiLimiter);
app.use('/admin', express.static(path.join(publicDir, 'admin')));
app.use('/uploads', express.static(path.join(publicDir, 'uploads')));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'investor-backend' });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/profile', profileRouter);
app.use('/api/v1', homeContentRouter);
app.use('/api/v1', uploadRouter);

app.use(notFoundHandler);
app.use(errorHandler);
