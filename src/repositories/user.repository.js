import { User } from '../models/user.model.js';

export async function findUserById(id) {
  return User.findById(id);
}

export async function findUserByEmail(email) {
  return User.findOne({ email });
}

export async function findUserByGoogleId(googleId) {
  return User.findOne({ googleId });
}

export async function findUserByPhone(countryCode, phoneNumber) {
  return User.findOne({ countryCode, phoneNumber });
}

export async function updateUserLocation(id, location) {
  return User.findByIdAndUpdate(
    id,
    {
      $set: {
        location: {
          ...location,
          updatedAt: new Date(),
        },
      },
    },
    { new: true },
  );
}

export async function updateUserProfile(id, profile) {
  return User.findByIdAndUpdate(
    id,
    {
      $set: profile,
    },
    { new: true },
  );
}

export async function upsertEmailUser(email) {
  return User.findOneAndUpdate(
    { email },
    {
      $set: {
        email,
        emailVerifiedAt: new Date(),
        lastLoginAt: new Date(),
      },
      $addToSet: { authProviders: 'email' },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
}

export async function upsertPhoneUser(countryCode, phoneNumber) {
  return User.findOneAndUpdate(
    { countryCode, phoneNumber },
    {
      $set: {
        countryCode,
        phoneNumber,
        phoneVerifiedAt: new Date(),
        lastLoginAt: new Date(),
      },
      $addToSet: { authProviders: 'phone' },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
}

export async function upsertGoogleUser(profile) {
  const existingByGoogle = await findUserByGoogleId(profile.googleId);

  if (existingByGoogle) {
    existingByGoogle.fullName = profile.fullName ?? existingByGoogle.fullName;
    existingByGoogle.avatarUrl = profile.avatarUrl ?? existingByGoogle.avatarUrl;
    existingByGoogle.email = profile.email ?? existingByGoogle.email;
    existingByGoogle.emailVerifiedAt = profile.emailVerifiedAt;
    existingByGoogle.lastLoginAt = new Date();
    if (!existingByGoogle.authProviders.includes('google')) {
      existingByGoogle.authProviders.push('google');
    }
    return existingByGoogle.save();
  }

  if (profile.email) {
    const existingByEmail = await findUserByEmail(profile.email);
    if (existingByEmail) {
      existingByEmail.googleId = profile.googleId;
      existingByEmail.fullName = profile.fullName ?? existingByEmail.fullName;
      existingByEmail.avatarUrl = profile.avatarUrl ?? existingByEmail.avatarUrl;
      existingByEmail.emailVerifiedAt = profile.emailVerifiedAt;
      existingByEmail.lastLoginAt = new Date();
      if (!existingByEmail.authProviders.includes('google')) {
        existingByEmail.authProviders.push('google');
      }
      return existingByEmail.save();
    }
  }

  return User.create({
    googleId: profile.googleId,
    email: profile.email,
    emailVerifiedAt: profile.emailVerifiedAt,
    fullName: profile.fullName,
    avatarUrl: profile.avatarUrl,
    lastLoginAt: new Date(),
    authProviders: ['google'],
  });
}
