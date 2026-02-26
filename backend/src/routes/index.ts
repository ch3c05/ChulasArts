/**
 * API Routes Index
 * Central router that combines all API routes
 */

import { Router } from 'express';
import authRoutes from './auth.js';
import albumRoutes from './albums.js';
import photoRoutes from './photos.js';
import socialRoutes from './social.js';
import imageRoutes from './images.js';
import galleryRoutes from './gallery.js';
import userRoutes from './users.js';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/albums', albumRoutes);
router.use('/', socialRoutes); // Social routes first: /photos/bookmarks, /photos/social-status before :photoId
router.use('/', photoRoutes); // Photo routes include /albums/:id/photos and /photos/:id
router.use('/images', imageRoutes); // Image serving routes
router.use('/gallery', galleryRoutes); // Public gallery routes
router.use('/users', userRoutes); // User profile routes

export default router;
