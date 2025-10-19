/**
 * API Routes Index
 * Central router that combines all API routes
 */

import { Router } from 'express';
import albumRoutes from './albums.js';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Mount route modules
router.use('/albums', albumRoutes);

// TODO: Import and mount remaining route modules as they are implemented
// import authRoutes from './auth.js';
// import photoRoutes from './photos.js';
// import userRoutes from './users.js';
// import galleryRoutes from './gallery.js';

// router.use('/auth', authRoutes);
// router.use('/photos', photoRoutes);
// router.use('/users', userRoutes);
// router.use('/gallery', galleryRoutes);

export default router;
