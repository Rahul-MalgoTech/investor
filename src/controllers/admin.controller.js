import { checkSmtpConnection } from '../services/email.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const smtpStatus = asyncHandler(async (_req, res) => {
  const result = await checkSmtpConnection();
  res.json({ success: true, data: result });
});
