import { ApiError } from '../utils/apiError.js';

function optionalString(body, name) {
  const value = body[name];
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new ApiError(400, `${name} must be a string`);
  }
  return value.trim();
}

function requiredNumber(body, name) {
  const value = Number(body[name]);
  if (!Number.isFinite(value)) {
    throw new ApiError(400, `${name} must be a valid number`);
  }
  return value;
}

export function validateLocationUpdate(body) {
  const latitude = requiredNumber(body, 'latitude');
  const longitude = requiredNumber(body, 'longitude');

  if (latitude < -90 || latitude > 90) {
    throw new ApiError(400, 'latitude is invalid');
  }

  if (longitude < -180 || longitude > 180) {
    throw new ApiError(400, 'longitude is invalid');
  }

  return {
    latitude,
    longitude,
    city: optionalString(body, 'city'),
    state: optionalString(body, 'state'),
    country: optionalString(body, 'country'),
    countryCode: optionalString(body, 'countryCode'),
    formattedAddress: optionalString(body, 'formattedAddress'),
  };
}

export function validateProfileUpdate(body) {
  const fullName = optionalString(body, 'fullName');
  const avatarUrl = optionalString(body, 'avatarUrl');

  if (fullName !== undefined && fullName.length > 80) {
    throw new ApiError(400, 'fullName is too long');
  }

  if (avatarUrl !== undefined && avatarUrl.length > 500) {
    throw new ApiError(400, 'avatarUrl is too long');
  }

  return {
    fullName,
    avatarUrl,
  };
}
