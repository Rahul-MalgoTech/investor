import {
  listNotifications,
  markNotificationRead,
} from '../services/notification.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const mine = asyncHandler(async (req, res) => {
  const notifications = await listNotifications(req.auth.sub);
  res.json({ success: true, data: { notifications } });
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await markNotificationRead(req.auth.sub, req.params.id);
  res.json({ success: true, data: { notification } });
});
