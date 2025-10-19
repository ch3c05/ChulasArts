/**
 * API Routes Index
 * Central router that combines all API routes
 */

import { Router } from 'express';
import authRoutes from './auth.js';
import albumRoutes from './albums.js';
import photoRoutes from './photos.js';

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
router.use('/', photoRoutes); // Photo routes include /albums/:id/photos and /photos/:id

// TODO: Import and mount remaining route modules as they are implemented
// import userRoutes from './users.js';
// import galleryRoutes from './gallery.js';

// router.use('/users', userRoutes);
// router.use('/gallery', galleryRoutes);

export default router;
