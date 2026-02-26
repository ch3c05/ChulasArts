/**
 * Social Routes
 * API endpoints for likes, bookmarks, and social interactions
 */

import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import {
  likePhoto,
  unlikePhoto,
  bookmarkPhoto,
  unbookmarkPhoto,
  getUserLikes,
  getUserBookmarks,
  getBookmarkedPhotos,
} from '../services/socialService';

const router = Router();

/**
 * POST /api/photos/social-status
 * Get like/bookmark status for multiple photos
 */
router.post(
  '/photos/social-status',
  authenticate,
  [
    body('photoIds').isArray().withMessage('Photo IDs must be an array'),
    body('photoIds.*').isMongoId().withMessage('Invalid photo ID in photoIds'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { photoIds } = req.body;

      const [likedIds, bookmarkedIds] = await Promise.all([
        getUserLikes(userId, photoIds),
        getUserBookmarks(userId, photoIds),
      ]);

      res.json({
        data: {
          liked: likedIds,
          bookmarked: bookmarkedIds,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/photos/bookmarks
 * Get user's bookmarked photos
 */
router.get(
  '/photos/bookmarks',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 24;

      const result = await getBookmarkedPhotos(userId, page, limit);

      res.json({
        data: result.photos,
        pagination: {
          page,
          limit,
          total: result.total,
          hasMore: result.hasMore,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/photos/:photoId/like
 * Like a photo
 */
router.post(
  '/photos/:photoId/like',
  authenticate,
  [param('photoId').isMongoId().withMessage('Invalid photo ID'), validate],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { photoId } = req.params;

      const result = await likePhoto(userId, photoId);

      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/photos/:photoId/like
 * Unlike a photo
 */
router.delete(
  '/photos/:photoId/like',
  authenticate,
  [param('photoId').isMongoId().withMessage('Invalid photo ID'), validate],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { photoId } = req.params;

      const result = await unlikePhoto(userId, photoId);

      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/photos/:photoId/bookmark
 * Bookmark a photo
 */
router.post(
  '/photos/:photoId/bookmark',
  authenticate,
  [param('photoId').isMongoId().withMessage('Invalid photo ID'), validate],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { photoId } = req.params;

      const result = await bookmarkPhoto(userId, photoId);

      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/photos/:photoId/bookmark
 * Remove bookmark from photo
 */
router.delete(
  '/photos/:photoId/bookmark',
  authenticate,
  [param('photoId').isMongoId().withMessage('Invalid photo ID'), validate],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { photoId } = req.params;

      const result = await unbookmarkPhoto(userId, photoId);

      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
