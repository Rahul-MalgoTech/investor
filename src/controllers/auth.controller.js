import {
  getCurrentUser,
  loginWithGoogle,
  sendEmailLoginOtp,
  sendPhoneLoginOtp,
  verifyEmailLoginOtp,
  verifyPhoneLoginOtp,
} from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  validateEmailRequest,
  validateEmailVerify,
  validateGoogleLogin,
  validatePhoneRequest,
  validatePhoneVerify,
} from '../validators/auth.validators.js';

export const requestEmailOtp = asyncHandler(async (req, res) => {
  const payload = validateEmailRequest(req.body);
  const result = await sendEmailLoginOtp(payload.email);
  res.status(202).json({ success: true, data: result });
});

export const verifyEmailOtp = asyncHandler(async (req, res) => {
  const payload = validateEmailVerify(req.body);
  const result = await verifyEmailLoginOtp(payload);
  res.json({ success: true, data: result });
});

export const requestPhoneOtp = asyncHandler(async (req, res) => {
  const payload = validatePhoneRequest(req.body);
  const result = await sendPhoneLoginOtp(payload);
  res.status(202).json({ success: true, data: result });
});

export const verifyPhoneOtp = asyncHandler(async (req, res) => {
  const payload = validatePhoneVerify(req.body);
  const result = await verifyPhoneLoginOtp(payload);
  res.json({ success: true, data: result });
});

export const googleLogin = asyncHandler(async (req, res) => {
  const payload = validateGoogleLogin(req.body);
  const result = await loginWithGoogle(payload.idToken);
  res.json({ success: true, data: result });
});

export const me = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.auth.sub);
  res.json({ success: true, data: { user } });
});
