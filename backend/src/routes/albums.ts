/**
 * Album Routes
 * Endpoints for album CRUD operations
 */

import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { createValidationChain } from '../middleware/validator.js';
import * as albumService from '../services/albumService.js';

const router = Router();

/**
 * GET /api/albums
 * Get all albums for authenticated user
 */
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const albums = await albumService.getUserAlbums(req.user!.userId);

    res.json({
      data: albums,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/albums
 * Create new album
 */
router.post(
  '/',
  authenticate,
  createValidationChain([
    body('title')
      .trim()
      .notEmpty()
      .isLength({ max: 200 })
      .withMessage('Title is required (max 200 chars)'),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description max 1000 chars'),
    body('published').optional().isBoolean().withMessage('Published must be boolean'),
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const album = await albumService.createAlbum(req.user!.userId, req.body);

      res.status(201).json({
        data: album,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/albums/:albumId
 * Get single album details
 */
router.get('/:albumId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const album = await albumService.getAlbumById(req.params.albumId, req.user?.userId);

    res.json({
      data: album,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/albums/:albumId
 * Update album
 */
router.patch(
  '/:albumId',
  authenticate,
  createValidationChain([
    body('title').optional().trim().notEmpty().isLength({ max: 200 }),
    body('description').optional().isLength({ max: 1000 }),
    body('published').optional().isBoolean(),
    body('coverPhotoId').optional().isMongoId(),
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const album = await albumService.updateAlbum(req.params.albumId, req.user!.userId, req.body);

      res.json({
        data: album,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/albums/:albumId
 * Delete album and all its photos
 */
router.delete(
  '/:albumId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await albumService.deleteAlbum(req.params.albumId, req.user!.userId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/albums/reorder
 * Reorder albums
 */
router.post(
  '/reorder',
  authenticate,
  createValidationChain([
    body('albums').isArray().withMessage('Albums must be an array'),
    body('albums.*.albumId').isMongoId().withMessage('Invalid album ID'),
    body('albums.*.sortOrder')
      .isInt({ min: 0 })
      .withMessage('sortOrder must be non-negative integer'),
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await albumService.reorderAlbums(req.user!.userId, req.body.albums);

      res.json({
        message: 'Albums reordered successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
