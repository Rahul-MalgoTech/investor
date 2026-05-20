import {
  findUserById,
  updateUserLocation,
  updateUserProfile,
} from '../repositories/user.repository.js';
import { ApiError } from '../utils/apiError.js';

export async function getProfile(userId) {
  const user = await findUserById(userId);
  if (!user || !user.isActive) {
    throw new ApiError(404, 'Profile not found');
  }
  return user.toJSON();
}

export async function saveProfileLocation(userId, location) {
  const user = await updateUserLocation(userId, location);
  if (!user || !user.isActive) {
    throw new ApiError(404, 'Profile not found');
  }
  return user.toJSON();
}

export async function saveProfile(userId, profile) {
  const user = await updateUserProfile(userId, profile);
  if (!user || !user.isActive) {
    throw new ApiError(404, 'Profile not found');
  }
  return user.toJSON();
}
