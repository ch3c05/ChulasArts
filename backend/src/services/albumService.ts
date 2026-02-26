/**
 * Album Service
 * Business logic for album CRUD operations
 */

import mongoose from 'mongoose';
import { Album, IAlbum } from '../models/Album.js';
import { Photo } from '../models/Photo.js';
import { User } from '../models/User.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors.js';

/**
 * Get all albums for a user
 */
export async function getUserAlbums(userId: string): Promise<IAlbum[]> {
  const albums = await Album.find({ userId }).sort({ sortOrder: 1, createdAt: -1 });

  return albums;
}

/**
 * Get single album by ID
 */
export async function getAlbumById(albumId: string, userId?: string): Promise<IAlbum> {
  const album = await Album.findById(albumId);

  if (!album) {
    throw new NotFoundError('Album not found');
  }

  // Check ownership for private albums
  if (!album.published && userId !== album.userId.toString()) {
    throw new ForbiddenError('You do not have permission to view this album');
  }

  return album;
}

/**
 * Create new album
 */
export async function createAlbum(
  userId: string,
  data: { title: string; description?: string; published?: boolean }
): Promise<IAlbum> {
  // Get user's current album count for sortOrder
  const userAlbums = await Album.countDocuments({ userId });

  const album = await Album.create({
    userId,
    title: data.title,
    description: data.description,
    published: data.published ?? false,
    sortOrder: userAlbums, // New album goes to end
  });

  // Increment user's album count
  await User.findByIdAndUpdate(userId, {
    $inc: { albumCount: 1 },
  });

  return album;
}

/**
 * Update album
 */
export async function updateAlbum(
  albumId: string,
  userId: string,
  data: { title?: string; description?: string; published?: boolean; coverPhotoId?: string }
): Promise<IAlbum> {
  const album = await Album.findById(albumId);

  if (!album) {
    throw new NotFoundError('Album not found');
  }

  // Check ownership
  if (album.userId.toString() !== userId) {
    throw new ForbiddenError('You do not have permission to update this album');
  }

  // Update fields
  if (data.title !== undefined) album.title = data.title;
  if (data.description !== undefined) {
    // Allow empty string to clear description
    album.description = data.description || undefined;
  }
  if (data.published !== undefined) album.published = data.published;
  if (data.coverPhotoId !== undefined) {
    // Verify cover photo belongs to this album
    if (data.coverPhotoId) {
      const photo = await Photo.findById(data.coverPhotoId);
      if (!photo || photo.albumId.toString() !== albumId) {
        throw new BadRequestError('Cover photo must belong to this album');
      }
    }
    album.coverPhotoId = data.coverPhotoId
      ? new mongoose.Types.ObjectId(data.coverPhotoId)
      : undefined;
  }

  await album.save();

  return album;
}

/**
 * Delete album and all its photos
 */
export async function deleteAlbum(albumId: string, userId: string): Promise<void> {
  const album = await Album.findById(albumId);

  if (!album) {
    throw new NotFoundError('Album not found');
  }

  // Check ownership
  if (album.userId.toString() !== userId) {
    throw new ForbiddenError('You do not have permission to delete this album');
  }

  // Get photo count before deletion
  const photoCount = album.photoCount;

  // Delete all photos in album (cascade delete)
  await Photo.deleteMany({ albumId });

  // Delete album
  await Album.findByIdAndDelete(albumId);

  // Update user counters
  await User.findByIdAndUpdate(userId, {
    $inc: {
      albumCount: -1,
      photoCount: -photoCount,
    },
  });
}

/**
 * Reorder albums
 */
export async function reorderAlbums(
  userId: string,
  albumOrders: Array<{ albumId: string; sortOrder: number }>
): Promise<void> {
  // Verify all albums belong to user
  const albumIds = albumOrders.map((a) => a.albumId);
  const albums = await Album.find({
    _id: { $in: albumIds },
    userId,
  });

  if (albums.length !== albumIds.length) {
    throw new BadRequestError('Some albums do not exist or do not belong to you');
  }

  // Update sort orders in bulk
  const bulkOps = albumOrders.map(({ albumId, sortOrder }) => ({
    updateOne: {
      filter: { _id: albumId, userId },
      update: { $set: { sortOrder } },
    },
  }));

  await Album.bulkWrite(bulkOps);
}

/**
 * Get public albums for a user (for profile viewing)
 */
export async function getPublicUserAlbums(userId: string): Promise<IAlbum[]> {
  const albums = await Album.find({
    userId,
    published: true,
  }).sort({ sortOrder: 1, createdAt: -1 });

  return albums;
}

/**
 * Increment photo count when photo is added
 */
export async function incrementPhotoCount(albumId: string): Promise<void> {
  await Album.findByIdAndUpdate(albumId, {
    $inc: { photoCount: 1 },
  });
}

/**
 * Decrement photo count when photo is removed
 */
export async function decrementPhotoCount(albumId: string): Promise<void> {
  await Album.findByIdAndUpdate(albumId, {
    $inc: { photoCount: -1 },
  });
}
