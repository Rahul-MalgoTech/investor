import { Router } from 'express';

import { markRead, mine } from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/authenticate.js';

export const notificationRouter = Router();

notificationRouter.get('/', authenticate, mine);
notificationRouter.patch('/:id/read', authenticate, markRead);
