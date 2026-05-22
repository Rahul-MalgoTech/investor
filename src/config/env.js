import dotenv from 'dotenv';

dotenv.config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function asBoolean(value) {
  return String(value).toLowerCase() === 'true';
}

function asNumber(name, fallback) {
  const value = Number(process.env[name] ?? fallback);
  if (Number.isNaN(value)) {
    throw new Error(`Environment variable ${name} must be a number`);
  }
  return value;
}

const gmailUser = process.env.GMAIL_USER;
const gmailPass = process.env.GMAIL_PASS;
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const configuredSmtpUser = process.env.SMTP_USER ?? emailUser ?? gmailUser;
const configuredSmtpPass = process.env.SMTP_PASS ?? emailPass ?? gmailPass;
const smtpHost =
  process.env.SMTP_HOST ??
  process.env.EMAIL_HOST ??
  (configuredSmtpUser || configuredSmtpPass ? 'smtp.gmail.com' : undefined);
const smtpUser = configuredSmtpUser;
const smtpPass = configuredSmtpPass;
const smtpFrom =
  process.env.SMTP_FROM ??
  (smtpUser ? `Investor <${smtpUser}>` : 'Investor <no-reply@investor.local>');

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: asNumber('PORT', 5002),
  mongoUri: required('MONGO_URI', 'mongodb://127.0.0.1:27017/investor'),
  corsOrigins: (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  jwtSecret: required('JWT_SECRET', 'dev_only_change_me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  otpTtlMinutes: asNumber('OTP_TTL_MINUTES', 10),
  otpLength: asNumber('OTP_LENGTH', 6),
  phoneDummyOtp: process.env.PHONE_DUMMY_OTP ?? '123456',
  emailFallbackOtp:
    process.env.EMAIL_FALLBACK_OTP ?? process.env.PHONE_DUMMY_OTP ?? '123456',
  emailDeliveryTimeoutMs: asNumber('EMAIL_DELIVERY_TIMEOUT_MS', 8000),
  adminToken: process.env.ADMIN_TOKEN,
  smtp: {
    host: smtpHost,
    port: asNumber('SMTP_PORT', smtpHost === 'smtp.gmail.com' ? 465 : 587),
    secure: asBoolean(
      process.env.SMTP_SECURE ?? (smtpHost === 'smtp.gmail.com' ? true : false),
    ),
    user: smtpUser,
    pass: smtpPass?.replaceAll(' ', ''),
    from: smtpFrom,
  },
  googleClientId: process.env.GOOGLE_CLIENT_ID,
};
