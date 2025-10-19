/**
 * Image Processing Service
 * Handles image optimization, resizing, and format conversion using Sharp
 */

import sharp from 'sharp';
import { BadRequestError } from '../utils/errors';

export interface ImageSizes {
  thumbnail: Buffer;
  medium: Buffer;
  full: Buffer;
}

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
}

/**
 * Process uploaded image into multiple sizes
 * @param buffer - Original image buffer
 * @returns Processed images in 3 sizes
 */
export async function processImage(buffer: Buffer): Promise<ImageSizes> {
  try {
    // Get image metadata
    const metadata = await sharp(buffer).metadata();

    if (!metadata.width || !metadata.height) {
      throw new BadRequestError('Invalid image file');
    }

    // Generate thumbnail (200px width, maintaining aspect ratio)
    const thumbnail = await sharp(buffer)
      .resize(200, null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();

    // Generate medium size (800px width, maintaining aspect ratio)
    const medium = await sharp(buffer)
      .resize(800, null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();

    // Generate full size (optimized, max 2000px width)
    const full = await sharp(buffer)
      .resize(2000, null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 90 })
      .toBuffer();

    return { thumbnail, medium, full };
  } catch (error) {
    console.error('Image processing error:', error);
    throw new BadRequestError('Failed to process image');
  }
}

/**
 * Extract image metadata
 * @param buffer - Image buffer
 * @returns Image dimensions and format
 */
export async function getImageMetadata(buffer: Buffer): Promise<ImageMetadata> {
  try {
    const metadata = await sharp(buffer).metadata();

    if (!metadata.width || !metadata.height || !metadata.format) {
      throw new BadRequestError('Invalid image file');
    }

    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: buffer.length,
    };
  } catch (error) {
    console.error('Metadata extraction error:', error);
    throw new BadRequestError('Failed to extract image metadata');
  }
}

/**
 * Validate image file
 * @param buffer - Image buffer
 * @param maxSize - Maximum file size in bytes (default 20MB)
 */
export async function validateImage(
  buffer: Buffer,
  maxSize: number = 20 * 1024 * 1024
): Promise<void> {
  // Check file size
  if (buffer.length > maxSize) {
    throw new BadRequestError(`File size exceeds maximum of ${maxSize / (1024 * 1024)}MB`);
  }

  // Validate it's actually an image
  try {
    const metadata = await sharp(buffer).metadata();

    const allowedFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif', 'tiff'];
    if (!metadata.format || !allowedFormats.includes(metadata.format)) {
      throw new BadRequestError('Unsupported image format. Allowed: JPEG, PNG, WebP, GIF, TIFF');
    }

    // Check dimensions (max 10000x10000)
    if (metadata.width && metadata.width > 10000) {
      throw new BadRequestError('Image width exceeds maximum of 10000px');
    }
    if (metadata.height && metadata.height > 10000) {
      throw new BadRequestError('Image height exceeds maximum of 10000px');
    }
  } catch (error) {
    if (error instanceof BadRequestError) {
      throw error;
    }
    throw new BadRequestError('Invalid image file');
  }
}
