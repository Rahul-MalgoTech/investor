import { Notification } from '../models/notification.model.js';
import { ApiError } from '../utils/apiError.js';

export async function createNotification({
  userId,
  type,
  title,
  body,
  metadata,
}) {
  if (!userId) {
    return null;
  }

  const notification = await Notification.create({
    userId,
    type,
    title,
    body,
    metadata,
  });
  return notification.toJSON();
}

export async function listNotifications(userId) {
  return Notification.find({ userId }).sort({ createdAt: -1 }).limit(100).lean();
}

export async function markNotificationRead(userId, notificationId) {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { $set: { readAt: new Date() } },
    { new: true },
  );

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  return notification.toJSON();
}
