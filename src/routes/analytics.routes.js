import { Router } from 'express';

import { dashboard, leaderboard } from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/authenticate.js';

export const analyticsRouter = Router();

analyticsRouter.get('/dashboard', authenticate, dashboard);
analyticsRouter.get('/leaderboard', authenticate, leaderboard);
