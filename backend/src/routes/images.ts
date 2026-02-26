/**
 * Image Routes
 * Serve images from Azure Blob Storage with proper authentication
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.js';
import { generateSignedImageUrl } from '../services/azureService.js';
import { Photo } from '../models/Photo.js';
import { Album } from '../models/Album.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

const router = Router();

/**
 * GET /api/images/:photoId/:size
 * Serve image with authentication check
 * Sizes: thumbnail, medium, original
 */
router.get(
  '/:photoId/:size',
  authenticate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { photoId, size } = req.params;
      const userId = req.user!.userId;

      // Validate size parameter
      if (!['thumbnail', 'medium', 'original'].includes(size)) {
        res.status(400).json({ error: 'Invalid image size' });
        return;
      }

      // Find the photo
      const photo = await Photo.findById(photoId);
      if (!photo) {
        throw new NotFoundError('Photo not found');
      }

      // Check if user has access to this photo
      const album = await Album.findById(photo.albumId);
      if (!album) {
        throw new NotFoundError('Album not found');
      }

      // Access control:
      // - Owner can always access
      // - Others can only access if photo and album are published
      const isOwner = album.userId.toString() === userId;
      const isPublic = photo.published && album.published;

      if (!isOwner && !isPublic) {
        throw new ForbiddenError('You do not have permission to view this image');
      }

      // Get the appropriate image URL
      let imageUrl: string;
      switch (size) {
        case 'thumbnail':
          imageUrl = photo.thumbnailUrl;
          break;
        case 'medium':
          imageUrl = photo.mediumUrl;
          break;
        case 'original':
          imageUrl = photo.originalUrl;
          break;
        default:
          imageUrl = photo.mediumUrl;
      }

      // Generate signed URL (24 hour expiry)
      const signedUrl = await generateSignedImageUrl(imageUrl, 86400);

      // Redirect to the signed URL
      res.redirect(signedUrl);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/images/public/:photoId/:size
 * Serve public images without authentication
 * Only works for published photos in published albums
 */
router.get(
  '/public/:photoId/:size',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { photoId, size } = req.params;

      // Validate size parameter
      if (!['thumbnail', 'medium', 'original'].includes(size)) {
        res.status(400).json({ error: 'Invalid image size' });
        return;
      }

      // Find the photo
      const photo = await Photo.findById(photoId);
      if (!photo) {
        throw new NotFoundError('Photo not found');
      }

      // Check if photo is published
      if (!photo.published) {
        throw new ForbiddenError('Photo is not published');
      }

      // Check if album is published
      const album = await Album.findById(photo.albumId);
      if (!album || !album.published) {
        throw new ForbiddenError('Album is not published');
      }

      // Get the appropriate image URL
      let imageUrl: string;
      switch (size) {
        case 'thumbnail':
          imageUrl = photo.thumbnailUrl;
          break;
        case 'medium':
          imageUrl = photo.mediumUrl;
          break;
        case 'original':
          imageUrl = photo.originalUrl;
          break;
        default:
          imageUrl = photo.mediumUrl;
      }

      // Generate signed URL (shorter expiry for public access - 1 hour)
      const signedUrl = await generateSignedImageUrl(imageUrl, 3600);

      // Redirect to the signed URL
      res.redirect(signedUrl);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
