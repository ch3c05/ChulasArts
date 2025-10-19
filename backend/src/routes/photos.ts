/**
 * Photo Routes
 * API endpoints for photo management
 */

import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { uploadSingle } from '../middleware/upload';
import {
  uploadPhoto,
  getAlbumPhotos,
  getPhotoById,
  updatePhoto,
  deletePhoto,
  reorderPhotos,
  publishPhoto,
} from '../services/photoService';

const router = Router();

/**
 * POST /api/albums/:albumId/photos
 * Upload a new photo to album
 */
router.post(
  '/albums/:albumId/photos',
  authenticate,
  uploadSingle, // Multer middleware
  [
    param('albumId').isMongoId().withMessage('Invalid album ID'),
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be 1-200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description max 1000 characters'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('published').optional().isBoolean().withMessage('Published must be boolean'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No photo file provided' });
      }

      const userId = req.user!.userId;
      const { albumId } = req.params;

      // Parse metadata if provided
      let metadata;
      if (req.body.metadata && typeof req.body.metadata === 'string') {
        try {
          metadata = JSON.parse(req.body.metadata);
        } catch {
          metadata = undefined;
        }
      } else {
        metadata = req.body.metadata;
      }

      const data = {
        title: req.body.title,
        description: req.body.description,
        tags: req.body.tags,
        published: req.body.published,
        metadata,
      };

      const photo = await uploadPhoto(userId, albumId, req.file, data);

      res.status(201).json({ data: photo });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/albums/:albumId/photos
 * Get photos for an album with pagination
 */
router.get(
  '/albums/:albumId/photos',
  [
    param('albumId').isMongoId().withMessage('Invalid album ID'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be >= 1'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { albumId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 24;

      const result = await getAlbumPhotos(albumId, page, limit);

      res.json({
        data: result.photos,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/photos/:photoId
 * Get single photo details
 */
router.get(
  '/photos/:photoId',
  [param('photoId').isMongoId().withMessage('Invalid photo ID'), validate],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { photoId } = req.params;
      const photo = await getPhotoById(photoId);
      res.json({ data: photo });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/photos/:photoId
 * Update photo metadata
 */
router.patch(
  '/photos/:photoId',
  authenticate,
  [
    param('photoId').isMongoId().withMessage('Invalid photo ID'),
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be 1-200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description max 1000 characters'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('published').optional().isBoolean().withMessage('Published must be boolean'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { photoId } = req.params;

      const data = {
        title: req.body.title,
        description: req.body.description,
        tags: req.body.tags,
        published: req.body.published,
        metadata: req.body.metadata,
      };

      const photo = await updatePhoto(photoId, userId, data);

      res.json({ data: photo });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/photos/:photoId
 * Delete a photo
 */
router.delete(
  '/photos/:photoId',
  authenticate,
  [param('photoId').isMongoId().withMessage('Invalid photo ID'), validate],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { photoId } = req.params;

      await deletePhoto(photoId, userId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/photos/reorder
 * Reorder photos in an album
 */
router.post(
  '/photos/reorder',
  authenticate,
  [
    body('albumId').isMongoId().withMessage('Invalid album ID'),
    body('photoIds').isArray({ min: 1 }).withMessage('photoIds must be non-empty array'),
    body('photoIds.*').isMongoId().withMessage('Invalid photo ID'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { albumId, photoIds } = req.body;

      await reorderPhotos(albumId, userId, photoIds);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/photos/:photoId/publish
 * Toggle photo published status
 */
router.patch(
  '/photos/:photoId/publish',
  authenticate,
  [
    param('photoId').isMongoId().withMessage('Invalid photo ID'),
    body('published').isBoolean().withMessage('Published must be boolean'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { photoId } = req.params;
      const { published } = req.body;

      const photo = await publishPhoto(photoId, userId, published);

      res.json({ data: photo });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
