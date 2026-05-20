import crypto from 'crypto';

export function generateOtp(length) {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return String(crypto.randomInt(min, max + 1));
}

export function getExpiryDate(ttlMinutes) {
  return new Date(Date.now() + ttlMinutes * 60 * 1000);
}
