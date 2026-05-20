import {
  getProfile,
  saveProfile,
  saveProfileLocation,
} from '../services/profile.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  validateLocationUpdate,
  validateProfileUpdate,
} from '../validators/profile.validators.js';

export const profile = asyncHandler(async (req, res) => {
  const user = await getProfile(req.auth.sub);
  res.json({ success: true, data: { user } });
});

export const updateLocation = asyncHandler(async (req, res) => {
  const payload = validateLocationUpdate(req.body);
  const user = await saveProfileLocation(req.auth.sub, payload);
  res.json({ success: true, data: { user } });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const payload = validateProfileUpdate(req.body);
  const user = await saveProfile(req.auth.sub, payload);
  res.json({ success: true, data: { user } });
});
