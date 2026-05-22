import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    plot: {
      title: { type: String, trim: true },
      size: { type: String, trim: true },
      location: { type: String, trim: true },
      priceRange: { type: String, trim: true },
      edition: { type: String, trim: true },
    },
    summary: {
      selectedLabel: { type: String, trim: true },
      totalLabel: { type: String, trim: true },
      totalAmount: { type: String, trim: true },
      premiumAmount: { type: String, trim: true },
      standardAmount: { type: String, trim: true },
      paymentMode: { type: String, enum: ['full', 'emi'], default: 'full' },
    },
    customization: {
      fullName: { type: String, trim: true },
      occasion: { type: String, trim: true },
      message: { type: String, trim: true },
    },
    delivery: {
      method: {
        type: String,
        enum: ['home', 'registry_handover'],
        default: 'home',
      },
      searchText: { type: String, trim: true },
      area: { type: String, trim: true },
      addressLine: { type: String, trim: true },
      buildingName: { type: String, trim: true },
      contactName: { type: String, trim: true },
      mobileNumber: { type: String, trim: true },
    },
    status: {
      type: String,
      enum: ['confirmed', 'processing', 'completed'],
      default: 'confirmed',
    },
  },
  { timestamps: true },
);

export const Order = mongoose.model('Order', orderSchema);
