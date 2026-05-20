import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';

const mimeExtensions = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export const uploadImage = asyncHandler(async (req, res) => {
  const { base64, mimeType } = req.body ?? {};
  if (!base64 || typeof base64 !== 'string') {
    throw new ApiError(400, 'base64 image is required');
  }

  const extension = mimeExtensions[mimeType] ?? 'jpg';
  const buffer = Buffer.from(base64, 'base64');
  if (buffer.length > 12000000) {
    throw new ApiError(400, 'image upload is too large');
  }

  res.json({
    success: true,
    data: {
      image: {
        base64,
        mimeType: mimeType ?? 'image/jpeg',
        extension,
      },
    },
  });
});
