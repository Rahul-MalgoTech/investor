import dns from 'node:dns';
import nodemailer from 'nodemailer';

import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';
import { logger } from '../utils/logger.js';

dns.setDefaultResultOrder?.('ipv4first');

let cachedGmailIpv4s;
let cachedWorkingTransportLabel;

export function hasSmtpConfig() {
  return Boolean(env.smtp.host && env.smtp.user && env.smtp.pass);
}

export function hasEmailDeliveryConfig() {
  return hasSmtpConfig();
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

function lookupIpv4(hostname, options, callback) {
  dns.lookup(hostname, { ...options, family: 4 }, callback);
}

async function resolveGmailIpv4s() {
  if (cachedGmailIpv4s?.length) {
    return cachedGmailIpv4s;
  }

  const addresses = await dns.promises.resolve4('smtp.gmail.com');
  if (!addresses.length) {
    throw new Error('No IPv4 address found for smtp.gmail.com');
  }

  cachedGmailIpv4s = addresses;
  return cachedGmailIpv4s;
}

function baseTransportOptions() {
  if (!hasSmtpConfig()) {
    throw new ApiError(500, 'SMTP is not configured');
  }

  return {
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    dnsTimeout: 10000,
    family: 4,
    lookup: lookupIpv4,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
  };
}

async function transportConfigs() {
  const baseOptions = baseTransportOptions();
  if (isGmailSmtp()) {
    const gmailIpv4s = await resolveGmailIpv4s();
    const preferred = {
      port: env.smtp.port,
      secure: env.smtp.secure,
    };
    const fallback = preferred.port === 587
      ? { port: 465, secure: true }
      : { port: 587, secure: false };

    const configs = [];
    for (const gmailIpv4 of gmailIpv4s) {
      for (const config of [preferred, fallback]) {
        configs.push({
          label: `gmail:${config.port}/${gmailIpv4}`,
          options: {
            ...baseOptions,
            host: gmailIpv4,
            port: config.port,
            secure: config.secure,
            requireTLS: config.port === 587,
            name: 'smtp.gmail.com',
            tls: {
              servername: 'smtp.gmail.com',
            },
          },
        });
      }
    }

    if (cachedWorkingTransportLabel) {
      configs.sort((a, b) => {
        if (a.label === cachedWorkingTransportLabel) return -1;
        if (b.label === cachedWorkingTransportLabel) return 1;
        return 0;
      });
    }

    return configs;
  }

  return [
    {
      label: `${env.smtp.host}:${env.smtp.port}`,
      options: {
        ...baseOptions,
        host: env.smtp.host,
        port: env.smtp.port,
        secure: env.smtp.secure,
        tls: {
          servername: env.smtp.host,
        },
      },
    },
  ];
}

function createTransporter(options) {
  return nodemailer.createTransport(options);
}

function serializeSmtpError(error) {
  return {
    code: error?.code,
    command: error?.command,
    response: error?.response,
    responseCode: error?.responseCode,
    message: error?.message,
  };
}

function rememberWorkingTransport(label) {
  cachedWorkingTransportLabel = label;
}

function otpEmailPayload({ to, otp }) {
  return {
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
  };
}

export async function checkEmailDeliveryConnection() {
  return checkSmtpConnection();
}

async function sendWithSmtp(payload) {
  let lastError;

  for (const config of await transportConfigs()) {
    const transporter = createTransporter(config.options);

    try {
      await transporter.sendMail(payload);
      rememberWorkingTransport(config.label);
      return;
    } catch (error) {
      lastError = error;
      logger.error(`Failed to send email OTP on ${config.label}`, serializeSmtpError(error));
    }
  }

  throw new ApiError(503, 'Email OTP service is temporarily unavailable');
}

async function checkSmtpConnection() {
  let lastError;

  for (const config of await transportConfigs()) {
    const transporter = createTransporter(config.options);

    try {
      await transporter.verify();
      rememberWorkingTransport(config.label);
      return {
        ok: true,
        host: isGmailSmtp() ? 'gmail' : env.smtp.host,
        user: env.smtp.user,
        from: getSenderAddress(),
        transport: config.label,
      };
    } catch (error) {
      lastError = error;
      logger.error(`SMTP verification failed on ${config.label}`, serializeSmtpError(error));
    }
  }

  return {
    ok: false,
    host: isGmailSmtp() ? 'gmail' : env.smtp.host,
    user: env.smtp.user,
    from: getSenderAddress(),
    error: serializeSmtpError(lastError),
  };
}

export async function sendEmailOtp({ to, otp }) {
  const payload = otpEmailPayload({ to, otp });

  await sendWithSmtp(payload);
}
