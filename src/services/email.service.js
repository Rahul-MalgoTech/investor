import nodemailer from 'nodemailer';

import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';
import { logger } from '../utils/logger.js';

export function hasSmtpConfig() {
  return Boolean(env.smtp.host && env.smtp.user && env.smtp.pass);
}

function isGmailSmtp() {
  const host = String(env.smtp.host ?? '').trim().toLowerCase();
  return host === 'gmail' || host === 'smtp.gmail.com';
}

function getSenderAddress() {
  const from = String(env.smtp.from ?? '').trim();
  if (!from || from.includes('investor.local')) {
    return env.smtp.user;
  }
  return from;
}

function createTransporter() {
  if (!hasSmtpConfig()) {
    throw new ApiError(500, 'SMTP is not configured');
  }

  const baseOptions = {
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
  };

  if (isGmailSmtp()) {
    return nodemailer.createTransport({
      ...baseOptions,
      service: 'gmail',
    });
  }

  return nodemailer.createTransport({
    ...baseOptions,
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    tls: {
      servername: env.smtp.host,
    },
  });
}

export async function checkSmtpConnection() {
  const transporter = createTransporter();

  try {
    await transporter.verify();
    return {
      ok: true,
      host: isGmailSmtp() ? 'gmail' : env.smtp.host,
      user: env.smtp.user,
      from: getSenderAddress(),
    };
  } catch (error) {
    logger.error('SMTP verification failed', {
      code: error?.code,
      command: error?.command,
      response: error?.response,
      responseCode: error?.responseCode,
      message: error?.message,
    });
    return {
      ok: false,
      host: isGmailSmtp() ? 'gmail' : env.smtp.host,
      user: env.smtp.user,
      from: getSenderAddress(),
      error: {
        code: error?.code,
        command: error?.command,
        response: error?.response,
        responseCode: error?.responseCode,
        message: error?.message,
      },
    };
  }
}

export async function sendEmailOtp({ to, otp }) {
  const transporter = createTransporter();

  try {
    await transporter.sendMail({
      from: getSenderAddress(),
      to,
      subject: 'Your Investor login OTP',
      text: `Your Investor OTP is ${otp}. It expires in ${env.otpTtlMinutes} minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Investor login OTP</h2>
          <p>Your OTP is:</p>
          <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px;">${otp}</p>
          <p>This OTP expires in ${env.otpTtlMinutes} minutes.</p>
        </div>
      `,
    });
  } catch (error) {
    logger.error('Failed to send email OTP', {
      code: error?.code,
      command: error?.command,
      response: error?.response,
      responseCode: error?.responseCode,
      message: error?.message,
    });
    throw new ApiError(503, 'Email OTP service is temporarily unavailable');
  }
}
