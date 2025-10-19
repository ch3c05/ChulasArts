/**
 * Photo Service
 * Business logic for photo management with Azure Blob Storage integration
 */

import { Photo } from '../models/Photo';
import { Album } from '../models/Album';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { uploadImageToAzure, deleteImageFromAzure } from './azureService';
import { processImage, getImageMetadata, validateImage } from './imageService';

/**
 * Upload a new photo to album
 */
export async function uploadPhoto(
  userId: string,
  albumId: string,
  file: Express.Multer.File,
  data: {
    title?: string;
    description?: string;
    tags?: string[];
    published?: boolean;
    metadata?: {
      capturedAt?: string;
      location?: string;
      camera?: string;
      lens?: string;
      focalLength?: number;
      aperture?: string;
      shutterSpeed?: string;
      iso?: number;
    };
  }
): Promise<any> {
  // Verify album exists and user owns it
  const album = await Album.findById(albumId);
  if (!album) {
    throw new NotFoundError('Album not found');
  }
  if (album.userId.toString() !== userId) {
    throw new ForbiddenError('You do not own this album');
  }

  // Validate image
  await validateImage(file.buffer);

  // Get metadata
  const metadata = await getImageMetadata(file.buffer);

  // Process image into 3 sizes
  const processedImages = await processImage(file.buffer);

  // Generate unique filename
  const timestamp = Date.now();
  const filename = `${userId}/${albumId}/${timestamp}`;

  // Upload all 3 sizes to Azure
  const [thumbnailUrl, mediumUrl, originalUrl] = await Promise.all([
    uploadImageToAzure(`${filename}-thumb.webp`, processedImages.thumbnail, 'image/webp'),
    uploadImageToAzure(`${filename}-medium.webp`, processedImages.medium, 'image/webp'),
    uploadImageToAzure(`${filename}-full.webp`, processedImages.full, 'image/webp'),
  ]);

  // Create photo document
  const photo = await Photo.create({
    albumId,
    userId,
    title: data.title || 'Untitled',
    description: data.description || '',
    originalUrl,
    mediumUrl,
    thumbnailUrl,
    width: metadata.width,
    height: metadata.height,
    fileSize: metadata.size,
    mimeType: 'image/webp',
    tags: data.tags || [],
    published: data.published ?? false,
    // EXIF metadata if provided
    capturedAt: data.metadata?.capturedAt,
    location: data.metadata?.location,
    camera: data.metadata?.camera,
    lens: data.metadata?.lens,
    focalLength: data.metadata?.focalLength,
    aperture: data.metadata?.aperture,
    shutterSpeed: data.metadata?.shutterSpeed,
    iso: data.metadata?.iso,
  });

  // Increment album photo count
  await Album.findByIdAndUpdate(albumId, { $inc: { photoCount: 1 } });

  return photo;
}

/**
 * Get paginated photos for an album
 */
export async function getAlbumPhotos(
  albumId: string,
  page: number = 1,
  limit: number = 24
): Promise<{ photos: any[]; pagination: any }> {
  const album = await Album.findById(albumId);
  if (!album) {
    throw new NotFoundError('Album not found');
  }

  const skip = (page - 1) * limit;

  const [photos, total] = await Promise.all([
    Photo.find({ albumId }).sort({ sortOrder: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    Photo.countDocuments({ albumId }),
  ]);

  return {
    photos,
    pagination: {
      page,
      limit,
      total,
      hasMore: skip + photos.length < total,
    },
  };
}

/**
 * Get single photo by ID
 */
export async function getPhotoById(photoId: string): Promise<any> {
  const photo = await Photo.findById(photoId).lean();
  if (!photo) {
    throw new NotFoundError('Photo not found');
  }

  // Increment view count
  await Photo.findByIdAndUpdate(photoId, { $inc: { viewCount: 1 } });

  return photo;
}

/**
 * Update photo metadata
 */
export async function updatePhoto(
  photoId: string,
  userId: string,
  data: {
    title?: string;
    description?: string;
    tags?: string[];
    published?: boolean;
    metadata?: {
      capturedAt?: string;
      location?: string;
      camera?: string;
      lens?: string;
      focalLength?: number;
      aperture?: string;
      shutterSpeed?: string;
      iso?: number;
    };
  }
): Promise<any> {
  const photo = await Photo.findById(photoId);
  if (!photo) {
    throw new NotFoundError('Photo not found');
  }
  if (photo.userId.toString() !== userId) {
    throw new ForbiddenError('You do not own this photo');
  }

  // Update allowed fields
  const updateFields: any = {};
  if (data.title !== undefined) updateFields.title = data.title;
  if (data.description !== undefined) updateFields.description = data.description;
  if (data.tags !== undefined) updateFields.tags = data.tags;
  if (data.published !== undefined) updateFields.published = data.published;
  if (data.metadata?.capturedAt !== undefined) updateFields.capturedAt = data.metadata.capturedAt;
  if (data.metadata?.location !== undefined) updateFields.location = data.metadata.location;
  if (data.metadata?.camera !== undefined) updateFields.camera = data.metadata.camera;
  if (data.metadata?.lens !== undefined) updateFields.lens = data.metadata.lens;
  if (data.metadata?.focalLength !== undefined)
    updateFields.focalLength = data.metadata.focalLength;
  if (data.metadata?.aperture !== undefined) updateFields.aperture = data.metadata.aperture;
  if (data.metadata?.shutterSpeed !== undefined)
    updateFields.shutterSpeed = data.metadata.shutterSpeed;
  if (data.metadata?.iso !== undefined) updateFields.iso = data.metadata.iso;

  const updatedPhoto = await Photo.findByIdAndUpdate(photoId, updateFields, { new: true }).lean();

  return updatedPhoto;
}

/**
 * Delete photo
 */
export async function deletePhoto(photoId: string, userId: string): Promise<void> {
  const photo = await Photo.findById(photoId);
  if (!photo) {
    throw new NotFoundError('Photo not found');
  }
  if (photo.userId.toString() !== userId) {
    throw new ForbiddenError('You do not own this photo');
  }

  // Delete from Azure Blob Storage
  try {
    const urlsToDelete = [photo.originalUrl, photo.mediumUrl, photo.thumbnailUrl];
    await Promise.all(urlsToDelete.map((url) => deleteImageFromAzure(url)));
  } catch (error) {
    console.error('Azure deletion error:', error);
    // Continue with DB deletion even if Azure deletion fails
  }

  // Delete from database
  await Photo.findByIdAndDelete(photoId);

  // Decrement album photo count
  await Album.findByIdAndUpdate(photo.albumId, { $inc: { photoCount: -1 } });
}

/**
 * Reorder photos in an album
 */
export async function reorderPhotos(
  albumId: string,
  userId: string,
  photoIds: string[]
): Promise<void> {
  // Verify album ownership
  const album = await Album.findById(albumId);
  if (!album) {
    throw new NotFoundError('Album not found');
  }
  if (album.userId.toString() !== userId) {
    throw new ForbiddenError('You do not own this album');
  }

  // Verify all photos exist and belong to the album
  const photos = await Photo.find({ _id: { $in: photoIds }, albumId });
  if (photos.length !== photoIds.length) {
    throw new BadRequestError('Invalid photo IDs');
  }

  // Update sortOrder for each photo
  const updates = photoIds.map((photoId, index) =>
    Photo.findByIdAndUpdate(photoId, { sortOrder: index })
  );

  await Promise.all(updates);
}

/**
 * Toggle photo published status
 */
export async function publishPhoto(
  photoId: string,
  userId: string,
  published: boolean
): Promise<any> {
  const photo = await Photo.findById(photoId);
  if (!photo) {
    throw new NotFoundError('Photo not found');
  }
  if (photo.userId.toString() !== userId) {
    throw new ForbiddenError('You do not own this photo');
  }

  const updatedPhoto = await Photo.findByIdAndUpdate(photoId, { published }, { new: true }).lean();

  return updatedPhoto;
}
