import nodemailer from 'nodemailer';

import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

export function hasSmtpConfig() {
  return Boolean(env.smtp.host && env.smtp.user && env.smtp.pass);
}

function createTransporter() {
  if (!hasSmtpConfig()) {
    throw new ApiError(500, 'SMTP is not configured');
  }

  return nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
  });
}

export async function sendEmailOtp({ to, otp }) {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: env.smtp.from,
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
}
