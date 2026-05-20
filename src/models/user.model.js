import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      sparse: true,
    },
    emailVerifiedAt: Date,
    countryCode: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
    },
    phoneVerifiedAt: Date,
    googleId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    avatarUrl: String,
    location: {
      latitude: Number,
      longitude: Number,
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true },
      countryCode: { type: String, trim: true },
      formattedAddress: { type: String, trim: true },
      updatedAt: Date,
    },
    lastLoginAt: Date,
    authProviders: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

userSchema.index(
  { countryCode: 1, phoneNumber: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: {
      countryCode: { $type: 'string' },
      phoneNumber: { $type: 'string' },
    },
  },
);

userSchema.set('toJSON', {
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.model('User', userSchema);
