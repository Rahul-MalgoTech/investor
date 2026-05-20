import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    asset: { type: String, trim: true },
    url: { type: String, trim: true },
    base64: { type: String },
    mimeType: { type: String, trim: true },
  },
  { _id: false },
);

const citySchema = new mongoose.Schema(
  {
    id: { type: String, trim: true, required: true },
    label: { type: String, trim: true, required: true },
    image: imageSchema,
    selected: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: false },
);

const plotSchema = new mongoose.Schema(
  {
    id: { type: String, trim: true, required: true },
    title: { type: String, trim: true, default: '' },
    place: { type: String, trim: true, default: '' },
    priceRange: { type: String, trim: true, default: '' },
    plotCount: { type: String, trim: true, default: '' },
    cityId: { type: String, trim: true },
    status: {
      type: String,
      enum: ['active', 'upcoming'],
      default: 'active',
    },
    image: imageSchema,
    iconImage: imageSchema,
    detail: { type: mongoose.Schema.Types.Mixed },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: false },
);

const bannerSchema = new mongoose.Schema(
  {
    headline: { type: String, trim: true },
    subtitle: { type: String, trim: true },
    image: imageSchema,
  },
  { _id: false },
);

const labelsSchema = new mongoose.Schema(
  {
    cityTitle: { type: String, trim: true },
    recommendationTitle: { type: String, trim: true },
    activeTabTitle: { type: String, trim: true },
    upcomingTabTitle: { type: String, trim: true },
  },
  { _id: false },
);

const homeContentSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'home', unique: true },
    banner: bannerSchema,
    labels: labelsSchema,
    cities: { type: [citySchema], default: [] },
    plots: { type: [plotSchema], default: [] },
    plotDetail: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
);

homeContentSchema.set('toJSON', {
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const HomeContent = mongoose.model('HomeContent', homeContentSchema);
