import { OtpChallenge } from '../models/otpChallenge.model.js';

export async function createOtpChallenge(payload) {
  return OtpChallenge.create(payload);
}

export async function findLatestActiveOtp(channel, destination) {
  return OtpChallenge.findOne({
    channel,
    destination,
    consumedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });
}
