import { Router } from 'express';

import { smtpStatus } from '../controllers/admin.controller.js';
import {
  adminHomeContent,
  publicHomeContent,
  updateHomeContent,
} from '../controllers/homeContent.controller.js';
import { adminAuth } from '../middleware/adminAuth.js';

export const homeContentRouter = Router();

homeContentRouter.get('/home-content', publicHomeContent);
homeContentRouter.get('/admin/smtp-status', adminAuth, smtpStatus);
homeContentRouter.get('/admin/home-content', adminAuth, adminHomeContent);
homeContentRouter.put('/admin/home-content', adminAuth, updateHomeContent);
