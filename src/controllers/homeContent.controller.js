import { getHomeContent, saveHomeContent } from '../services/homeContent.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validateHomeContentUpdate } from '../validators/homeContent.validators.js';

export const publicHomeContent = asyncHandler(async (_req, res) => {
  const content = await getHomeContent();
  res.json({ success: true, data: { homeContent: content } });
});

export const adminHomeContent = asyncHandler(async (_req, res) => {
  const content = await getHomeContent({ includeInactive: true });
  res.json({ success: true, data: { homeContent: content } });
});

export const updateHomeContent = asyncHandler(async (req, res) => {
  const payload = validateHomeContentUpdate(req.body);
  const content = await saveHomeContent(payload);
  res.json({ success: true, data: { homeContent: content } });
});
