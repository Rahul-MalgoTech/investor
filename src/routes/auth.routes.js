import { Router } from 'express';

import {
  googleLogin,
  me,
  requestEmailOtp,
  requestPhoneOtp,
  verifyEmailOtp,
  verifyPhoneOtp,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { otpLimiter } from '../middleware/rateLimit.js';

export const authRouter = Router();

authRouter.post('/email/request-otp', otpLimiter, requestEmailOtp);
authRouter.post('/email/verify-otp', verifyEmailOtp);
authRouter.post('/phone/request-otp', otpLimiter, requestPhoneOtp);
authRouter.post('/phone/verify-otp', verifyPhoneOtp);
authRouter.post('/google', googleLogin);
authRouter.get('/me', authenticate, me);
