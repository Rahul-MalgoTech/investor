import {
  findUserById,
  upsertEmailUser,
  upsertGoogleUser,
  upsertPhoneUser,
} from '../repositories/user.repository.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';
import { signAuthToken } from '../utils/jwt.js';
import { normalizeEmail, normalizePhone } from '../utils/normalizers.js';
import { requestEmailOtp, requestPhoneOtp, verifyOtp } from './otp.service.js';
import { verifyGoogleIdToken } from './googleAuth.service.js';

function authResponse(user) {
  return {
    token: signAuthToken(user),
    user: user.toJSON(),
  };
}

export async function sendEmailLoginOtp(email) {
  const normalizedEmail = normalizeEmail(email);
  return requestEmailOtp(normalizedEmail);
}

export async function verifyEmailLoginOtp({ email, otp }) {
  const normalizedEmail = normalizeEmail(email);
  if (otp !== env.emailFallbackOtp) {
    await verifyOtp({
      channel: 'email',
      destination: normalizedEmail,
      otp,
    });
  }
  const user = await upsertEmailUser(normalizedEmail);
  return authResponse(user);
}

export async function sendPhoneLoginOtp({ countryCode, phoneNumber }) {
  const phone = normalizePhone(countryCode, phoneNumber);
  return requestPhoneOtp(phone);
}

export async function verifyPhoneLoginOtp({ countryCode, phoneNumber, otp }) {
  const phone = normalizePhone(countryCode, phoneNumber);
  await verifyOtp({
    channel: 'phone',
    destination: `${phone.countryCode}${phone.phoneNumber}`,
    otp,
  });
  const user = await upsertPhoneUser(phone.countryCode, phone.phoneNumber);
  return authResponse(user);
}

export async function loginWithGoogle(idToken) {
  const googleProfile = await verifyGoogleIdToken(idToken);
  const user = await upsertGoogleUser(googleProfile);
  return authResponse(user);
}

export async function getCurrentUser(userId) {
  const user = await findUserById(userId);
  if (!user || !user.isActive) {
    throw new ApiError(401, 'User not found');
  }
  return user.toJSON();
}
