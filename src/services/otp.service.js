import { env } from '../config/env.js';
import {
  createOtpChallenge,
  findLatestActiveOtp,
} from '../repositories/otp.repository.js';
import { logger } from '../utils/logger.js';
import { generateOtp, getExpiryDate } from '../utils/otp.js';
import { hasEmailDeliveryConfig, sendEmailOtp } from './email.service.js';

const maxOtpAttempts = 5;

async function createEmailFallbackOtp(email, reason) {
  logger.warn(`Using fallback email OTP for ${email}: ${reason}`);
  await createOtpChallenge({
    channel: 'email',
    destination: email,
    otp: env.emailFallbackOtp,
    expiresAt: getExpiryDate(env.otpTtlMinutes),
  });

  return {
    message: 'Email OTP fallback generated. Use the fallback OTP to login.',
    dummyOtp: env.nodeEnv !== 'production' ? env.emailFallbackOtp : undefined,
  };
}

function sendEmailOtpWithTimeout({ to, otp }) {
  return Promise.race([
    sendEmailOtp({ to, otp }),
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('email delivery timed out'));
      }, env.emailDeliveryTimeoutMs);
    }),
  ]);
}

export async function requestEmailOtp(email) {
  const otp = generateOtp(env.otpLength);

  if (!hasEmailDeliveryConfig()) {
    return createEmailFallbackOtp(email, 'email delivery is not configured');
  }

  try {
    await sendEmailOtpWithTimeout({ to: email, otp });
  } catch (error) {
    return createEmailFallbackOtp(email, error.message ?? 'email delivery failed');
  }

  await createOtpChallenge({
    channel: 'email',
    destination: email,
    otp,
    expiresAt: getExpiryDate(env.otpTtlMinutes),
  });

  return {
    message: 'Email OTP sent',
    dummyOtp: env.nodeEnv !== 'production' ? otp : undefined,
  };
}

export async function requestPhoneOtp({ countryCode, phoneNumber }) {
  const destination = `${countryCode}${phoneNumber}`;

  await createOtpChallenge({
    channel: 'phone',
    destination,
    otp: env.phoneDummyOtp,
    expiresAt: getExpiryDate(env.otpTtlMinutes),
  });

  return {
    message: 'Dummy phone OTP generated',
    dummyOtp: env.nodeEnv === 'production' ? undefined : env.phoneDummyOtp,
  };
}

export async function verifyOtp({ channel, destination, otp }) {
  const challenge = await findLatestActiveOtp(channel, destination);

  if (!challenge) {
    throw new ApiError(400, 'OTP is expired or not found');
  }

  if (challenge.attempts >= maxOtpAttempts) {
    throw new ApiError(429, 'Too many OTP attempts');
  }

  challenge.attempts += 1;

  if (challenge.otp !== otp) {
    await challenge.save();
    throw new ApiError(400, 'Invalid OTP');
  }

  challenge.consumedAt = new Date();
  await challenge.save();
}
