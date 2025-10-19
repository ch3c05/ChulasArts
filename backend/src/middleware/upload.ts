/**
 * File Upload Middleware
 * Configures Multer for image uploads with validation
 */

import multer from 'multer';
import { BadRequestError } from '../utils/errors';

// Configure Multer to store files in memory (we'll process before Azure upload)
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/tiff',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Only image files are allowed (JPEG, PNG, WebP, GIF, TIFF)'));
  }
};

// Configure Multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB max file size
    files: 10, // Max 10 files per request
  },
});

// Export middleware for single and multiple file uploads
export const uploadSingle = upload.single('photo');
export const uploadMultiple = upload.array('photos', 10);

export default upload;
