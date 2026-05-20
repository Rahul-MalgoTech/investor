import { Router } from 'express';

import {
  profile,
  updateLocation,
  updateProfile,
} from '../controllers/profile.controller.js';
import { authenticate } from '../middleware/authenticate.js';

export const profileRouter = Router();

profileRouter.use(authenticate);
profileRouter.get('/', profile);
profileRouter.put('/', updateProfile);
profileRouter.post('/location', updateLocation);
