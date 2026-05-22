import { env } from '../config/env.js';
import {
  createOtpChallenge,
  findLatestActiveOtp,
} from '../repositories/otp.repository.js';
import { ApiError } from '../utils/apiError.js';
import { logger } from '../utils/logger.js';
import { generateOtp, getExpiryDate } from '../utils/otp.js';
import { hasEmailDeliveryConfig, sendEmailOtp } from './email.service.js';

const maxOtpAttempts = 5;

export async function requestEmailOtp(email) {
  const otp = generateOtp(env.otpLength);

  if (!hasEmailDeliveryConfig()) {
    if (env.nodeEnv === 'production') {
      throw new ApiError(500, 'Email OTP service is not configured');
    }

    logger.warn(`Email delivery is not configured. Email OTP for ${email}: ${otp}`);
    await createOtpChallenge({
      channel: 'email',
      destination: email,
      otp,
      expiresAt: getExpiryDate(env.otpTtlMinutes),
    });
    return {
      message: 'Email OTP generated. Email delivery is not configured, so OTP was not emailed.',
      dummyOtp: otp,
    };
  }

  await sendEmailOtp({ to: email, otp });
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
