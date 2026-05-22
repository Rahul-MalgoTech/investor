import { Router } from 'express';

import { create, mine } from '../controllers/order.controller.js';
import { authenticate } from '../middleware/authenticate.js';

export const orderRouter = Router();

orderRouter.post('/', authenticate, create);
orderRouter.get('/mine', authenticate, mine);
