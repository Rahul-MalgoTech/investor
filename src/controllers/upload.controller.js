import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';

const uploadDir = path.resolve(process.cwd(), 'public/uploads');
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

  await mkdir(uploadDir, { recursive: true });
  const filename = `${Date.now()}-${randomUUID()}.${extension}`;
  await writeFile(path.join(uploadDir, filename), buffer);

  res.json({
    success: true,
    data: {
      image: {
        url: `/uploads/${filename}`,
        mimeType: mimeType ?? 'image/jpeg',
      },
    },
  });
});
