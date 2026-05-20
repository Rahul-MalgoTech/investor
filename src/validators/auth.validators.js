import { ApiError } from '../utils/apiError.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const countryCodePattern = /^\+\d{1,4}$/;
const phonePattern = /^\d{6,15}$/;
const otpPattern = /^\d{4,8}$/;

function assertString(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ApiError(400, `${field} is required`);
  }
  return value.trim();
}

export function validateEmailRequest(body) {
  const email = assertString(body.email, 'email').toLowerCase();
  if (!emailPattern.test(email)) {
    throw new ApiError(400, 'email is invalid');
  }
  return { email };
}

export function validateEmailVerify(body) {
  const { email } = validateEmailRequest(body);
  const otp = assertString(body.otp, 'otp');
  if (!otpPattern.test(otp)) {
    throw new ApiError(400, 'otp is invalid');
  }
  return { email, otp };
}

export function validatePhoneRequest(body) {
  const countryCode = assertString(body.countryCode, 'countryCode');
  const phoneNumber = assertString(body.phoneNumber, 'phoneNumber');

  if (!countryCodePattern.test(countryCode)) {
    throw new ApiError(400, 'countryCode must be like +91');
  }

  if (!phonePattern.test(phoneNumber)) {
    throw new ApiError(400, 'phoneNumber must contain 6 to 15 digits');
  }

  return { countryCode, phoneNumber };
}

export function validatePhoneVerify(body) {
  const phone = validatePhoneRequest(body);
  const otp = assertString(body.otp, 'otp');
  if (!otpPattern.test(otp)) {
    throw new ApiError(400, 'otp is invalid');
  }
  return { ...phone, otp };
}

export function validateGoogleLogin(body) {
  const idToken = assertString(body.idToken, 'idToken');
  return { idToken };
}
