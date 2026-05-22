import { OAuth2Client } from 'google-auth-library';

import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';
import { normalizeEmail } from '../utils/normalizers.js';

const client = new OAuth2Client(env.googleClientId);

export async function verifyGoogleIdToken(idToken) {
  if (!env.googleClientId) {
    throw new ApiError(500, 'Google auth is not configured');
  }

  let ticket;
  try {
    ticket = await client.verifyIdToken({
      idToken,
      audience: env.googleClientId,
    });
  } catch (_error) {
    throw new ApiError(401, 'Invalid Google token');
  }

  const payload = ticket.getPayload();
  if (!payload?.sub) {
    throw new ApiError(401, 'Invalid Google token');
  }

  return {
    googleId: payload.sub,
    email: payload.email ? normalizeEmail(payload.email) : undefined,
    emailVerifiedAt: payload.email_verified ? new Date() : undefined,
    fullName: payload.name,
    avatarUrl: payload.picture,
  };
}
