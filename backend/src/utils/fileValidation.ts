/**
 * File Validation Utilities
 *
 * Validates uploaded files (size, type, dimensions)
 * Used by photo upload endpoints
 */

import { BadRequestError } from './errors.js';

// File size limits (in bytes)
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_DIMENSION = 8000; // 8000px max width/height

// Allowed MIME types for image uploads
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

// Allowed file extensions
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate file size
 * @param size - File size in bytes
 * @returns Validation result
 */
export function validateFileSize(size: number): FileValidationResult {
  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
}

/**
 * Validate file MIME type
 * @param mimeType - File MIME type
 * @returns Validation result
 */
export function validateFileType(mimeType: string): FileValidationResult {
  if (!ALLOWED_IMAGE_TYPES.includes(mimeType.toLowerCase())) {
    return {
      valid: false,
      error: `File type '${mimeType}' is not allowed. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Validate file extension
 * @param filename - Original filename
 * @returns Validation result
 */
export function validateFileExtension(filename: string): FileValidationResult {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));

  if (!ALLOWED_IMAGE_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `File extension '${extension}' is not allowed. Allowed extensions: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Validate complete uploaded file
 * @param file - Multer file object
 * @returns True if valid
 * @throws BadRequestError if validation fails
 */
export function validateUploadedFile(file: {
  size: number;
  mimetype: string;
  originalname: string;
}): boolean {
  // Validate file size
  const sizeValidation = validateFileSize(file.size);
  if (!sizeValidation.valid) {
    throw new BadRequestError(sizeValidation.error);
  }

  // Validate MIME type
  const typeValidation = validateFileType(file.mimetype);
  if (!typeValidation.valid) {
    throw new BadRequestError(typeValidation.error);
  }

  // Validate extension
  const extensionValidation = validateFileExtension(file.originalname);
  if (!extensionValidation.valid) {
    throw new BadRequestError(extensionValidation.error);
  }

  return true;
}

/**
 * Generate unique filename for uploaded image
 * @param userId - User ID
 * @param originalName - Original filename
 * @returns Unique filename with timestamp
 */
export function generateUniqueFilename(userId: string, originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.toLowerCase().substring(originalName.lastIndexOf('.'));

  return `${userId}-${timestamp}-${randomString}${extension}`;
}

/**
 * Parse image metadata from buffer (basic validation)
 * Note: Actual dimension validation happens in sharp during processing
 * @param buffer - Image buffer
 * @returns Basic file info
 */
export function parseImageMetadata(buffer: Buffer): {
  size: number;
} {
  return {
    size: buffer.length,
  };
}
