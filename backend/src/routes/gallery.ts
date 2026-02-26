/**
 * Gallery Routes
 * Public gallery browsing endpoints for published photos
 */

import { Router, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Photo } from '../models/Photo.js';
import { User } from '../models/User.js';
import { Album } from '../models/Album.js';
import { generateAvatarSignedUrl } from '../services/azureService.js';

const router = Router();

interface GalleryQuery {
  page?: string;
  limit?: string;
  tags?: string;
  userId?: string;
  sort?: 'recent' | 'popular' | 'views';
  search?: string;
}

/**
 * GET /api/gallery
 * Browse all published photos with filtering and pagination
 */
router.get(
  '/',
  async (req: Request<{}, {}, {}, GalleryQuery>, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const limit = Math.min(parseInt(req.query.limit || '24', 10), 100);
      const skip = (page - 1) * limit;

      // Build query
      const query: mongoose.FilterQuery<typeof Photo.schema.obj> = { published: true };

      // Filter by tags
      if (req.query.tags) {
        const tags = req.query.tags.split(',').map((tag) => tag.trim());
        query.tags = { $in: tags };
      }

      // Filter by user/artist
      if (req.query.userId) {
        query.userId = req.query.userId;
      }

      // Search by title or description
      if (req.query.search) {
        const searchRegex = new RegExp(req.query.search, 'i');
        query.$or = [{ title: searchRegex }, { description: searchRegex }];
      }

      // Sort options
      let sort: Record<string, 1 | -1> = { createdAt: -1 }; // Default: recent
      if (req.query.sort === 'popular') {
        sort = { likeCount: -1, createdAt: -1 };
      } else if (req.query.sort === 'views') {
        sort = { viewCount: -1, createdAt: -1 };
      }

      // Fetch photos
      const [photos, total] = await Promise.all([
        Photo.find(query).sort(sort).skip(skip).limit(limit).select('-__v').lean(),
        Photo.countDocuments(query),
      ]);

      // Fetch user info for each photo
      const userIds = [...new Set(photos.map((p) => p.userId.toString()))];

      const users = await User.find({ _id: { $in: userIds } })
        .select('_id name avatarUrl')
        .lean();

      const userMap = new Map(
        users.map((u) => [u._id.toString(), { name: u.name, avatarUrl: u.avatarUrl }])
      );

      // Enrich photos with username and avatarUrl (using name field from User model)
      const enrichedPhotos = await Promise.all(
        photos.map(async (photo) => {
          const userId = photo.userId.toString();
          const userInfo = userMap.get(userId);

          // Generate signed URL for avatar if it exists
          const avatarUrl = userInfo?.avatarUrl
            ? await generateAvatarSignedUrl(userInfo.avatarUrl)
            : undefined;

          return {
            ...photo,
            username: userInfo?.name,
            avatarUrl,
          };
        })
      );

      res.json({
        data: enrichedPhotos,
        pagination: {
          page,
          limit,
          total,
          hasMore: skip + photos.length < total,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/gallery/artists
 * Get list of artists with published photos
 */
router.get('/artists', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // Get unique user IDs from published photos
    const userIds = await Photo.distinct('userId', { published: true });

    // Fetch user details
    const artists = await User.find({ _id: { $in: userIds } })
      .select('_id name')
      .sort({ name: 1 })
      .lean();

    // Map to use username field
    const artistsWithUsername = artists.map((artist) => ({
      _id: artist._id,
      username: artist.name,
    }));

    res.json({
      data: artistsWithUsername,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/gallery/tags
 * Get all unique tags from published photos
 */
router.get('/tags', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const tags = await Photo.aggregate([
      { $match: { published: true } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ]);

    res.json({
      data: tags.map((t) => ({ tag: t._id, count: t.count })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/gallery/:photoId
 * Get single photo details (public)
 */
router.get('/:photoId', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const photo = await Photo.findOne({
      _id: req.params.photoId,
      published: true,
    }).lean();

    if (!photo) {
      res.status(404).json({ error: 'Photo not found' });
      return;
    }

    // Get user info
    const user = await User.findById(photo.userId).select('_id name avatarUrl').lean();

    // Get album info
    const album = await Album.findById(photo.albumId).select('_id title').lean();

    // Generate signed URL for avatar if it exists
    const avatarUrl = user?.avatarUrl ? await generateAvatarSignedUrl(user.avatarUrl) : undefined;

    // Increment view count
    await Photo.findByIdAndUpdate(req.params.photoId, { $inc: { viewCount: 1 } });

    res.json({
      data: {
        ...photo,
        username: user?.name,
        avatarUrl,
        albumTitle: album?.title,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
