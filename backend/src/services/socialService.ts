/**
 * Social Service
 * Business logic for likes and bookmarks
 */

import mongoose from 'mongoose';
import { Like } from '../models/Like';
import { Bookmark } from '../models/Bookmark';
import { Photo, IPhoto } from '../models/Photo';
import { NotFoundError, BadRequestError } from '../utils/errors';

/**
 * Like a photo
 */
export async function likePhoto(
  userId: string,
  photoId: string
): Promise<{ liked: boolean; likeCount: number }> {
  const photo = await Photo.findById(photoId);
  if (!photo) {
    throw new NotFoundError('Photo not found');
  }

  const existingLike = await Like.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    photoId: new mongoose.Types.ObjectId(photoId),
  });

  if (existingLike) {
    throw new BadRequestError('Photo already liked');
  }

  await Like.create({
    userId: new mongoose.Types.ObjectId(userId),
    photoId: new mongoose.Types.ObjectId(photoId),
  });

  const updated = await Photo.findByIdAndUpdate(photoId, { $inc: { likeCount: 1 } }, { new: true });

  return {
    liked: true,
    likeCount: updated?.likeCount ?? photo.likeCount + 1,
  };
}

/**
 * Unlike a photo
 */
export async function unlikePhoto(
  userId: string,
  photoId: string
): Promise<{ liked: boolean; likeCount: number }> {
  const photo = await Photo.findById(photoId);
  if (!photo) {
    throw new NotFoundError('Photo not found');
  }

  const like = await Like.findOneAndDelete({
    userId: new mongoose.Types.ObjectId(userId),
    photoId: new mongoose.Types.ObjectId(photoId),
  });

  if (!like) {
    throw new NotFoundError('Like not found');
  }

  const updated = await Photo.findByIdAndUpdate(
    photoId,
    { $inc: { likeCount: -1 } },
    { new: true }
  );

  return {
    liked: false,
    likeCount: Math.max(updated?.likeCount ?? 0, 0),
  };
}

/**
 * Check if user has liked a photo
 */
export async function hasLiked(userId: string, photoId: string): Promise<boolean> {
  const like = await Like.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    photoId: new mongoose.Types.ObjectId(photoId),
  });
  return !!like;
}

/**
 * Get user's liked photo IDs
 */
export async function getUserLikes(userId: string, photoIds: string[]): Promise<string[]> {
  const likes = await Like.find({
    userId: new mongoose.Types.ObjectId(userId),
    photoId: { $in: photoIds.map((id) => new mongoose.Types.ObjectId(id)) },
  });
  return likes.map((like) => like.photoId.toString());
}

/**
 * Bookmark a photo
 */
export async function bookmarkPhoto(
  userId: string,
  photoId: string
): Promise<{ bookmarked: boolean; bookmarkCount: number }> {
  const photo = await Photo.findById(photoId);
  if (!photo) {
    throw new NotFoundError('Photo not found');
  }

  const existingBookmark = await Bookmark.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    photoId: new mongoose.Types.ObjectId(photoId),
  });

  if (existingBookmark) {
    throw new BadRequestError('Photo already bookmarked');
  }

  await Bookmark.create({
    userId: new mongoose.Types.ObjectId(userId),
    photoId: new mongoose.Types.ObjectId(photoId),
  });

  const updated = await Photo.findByIdAndUpdate(
    photoId,
    { $inc: { bookmarkCount: 1 } },
    { new: true }
  );

  return {
    bookmarked: true,
    bookmarkCount: updated?.bookmarkCount ?? photo.bookmarkCount + 1,
  };
}

/**
 * Remove bookmark from photo
 */
export async function unbookmarkPhoto(
  userId: string,
  photoId: string
): Promise<{ bookmarked: boolean; bookmarkCount: number }> {
  const photo = await Photo.findById(photoId);
  if (!photo) {
    throw new NotFoundError('Photo not found');
  }

  const bookmark = await Bookmark.findOneAndDelete({
    userId: new mongoose.Types.ObjectId(userId),
    photoId: new mongoose.Types.ObjectId(photoId),
  });

  if (!bookmark) {
    throw new NotFoundError('Bookmark not found');
  }

  const updated = await Photo.findByIdAndUpdate(
    photoId,
    { $inc: { bookmarkCount: -1 } },
    { new: true }
  );

  return {
    bookmarked: false,
    bookmarkCount: Math.max(updated?.bookmarkCount ?? 0, 0),
  };
}

/**
 * Check if user has bookmarked a photo
 */
export async function hasBookmarked(userId: string, photoId: string): Promise<boolean> {
  const bookmark = await Bookmark.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    photoId: new mongoose.Types.ObjectId(photoId),
  });
  return !!bookmark;
}

/**
 * Get user's bookmarked photo IDs
 */
export async function getUserBookmarks(userId: string, photoIds: string[]): Promise<string[]> {
  const bookmarks = await Bookmark.find({
    userId: new mongoose.Types.ObjectId(userId),
    photoId: { $in: photoIds.map((id) => new mongoose.Types.ObjectId(id)) },
  });
  return bookmarks.map((bookmark) => bookmark.photoId.toString());
}

/**
 * Get user's bookmarked photos with full details
 */
export async function getBookmarkedPhotos(
  userId: string,
  page: number = 1,
  limit: number = 24
): Promise<{ photos: IPhoto[]; total: number; hasMore: boolean }> {
  const skip = (page - 1) * limit;

  // Get bookmarks sorted by creation date (most recent first)
  const bookmarks = await Bookmark.find({
    userId: new mongoose.Types.ObjectId(userId),
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit + 1)
    .populate({
      path: 'photoId',
      populate: [
        { path: 'albumId', select: 'title' },
        { path: 'userId', select: 'name username' },
      ],
    });

  const hasMore = bookmarks.length > limit;
  const photos = bookmarks.slice(0, limit).map((b) => b.photoId as unknown as IPhoto);

  // Get total count
  const total = await Bookmark.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
  });

  return {
    photos: photos.filter((p) => p !== null), // Filter out deleted photos
    total,
    hasMore,
  };
}
