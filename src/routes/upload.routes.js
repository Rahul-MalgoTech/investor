import { Router } from 'express';

import { uploadImage } from '../controllers/upload.controller.js';
import { adminAuth } from '../middleware/adminAuth.js';

export const uploadRouter = Router();

uploadRouter.post('/admin/uploads', adminAuth, uploadImage);
