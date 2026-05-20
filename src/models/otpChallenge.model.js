import mongoose from 'mongoose';

const otpChallengeSchema = new mongoose.Schema(
  {
    channel: {
      type: String,
      enum: ['email', 'phone'],
      required: true,
      index: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    attempts: {
      type: Number,
      default: 0,
    },
    consumedAt: Date,
  },
  { timestamps: true },
);

otpChallengeSchema.index({ channel: 1, destination: 1, createdAt: -1 });

export const OtpChallenge = mongoose.model(
  'OtpChallenge',
  otpChallengeSchema,
);
