import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 150,
  skip: (req) =>
    req.path.startsWith('/admin') || req.path.startsWith('/api/v1/admin'),
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  message: {
    success: false,
    message: 'Too many OTP requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
