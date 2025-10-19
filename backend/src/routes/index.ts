/**
 * API Routes Index
 * Central router that combines all API routes
 */

import { Router } from 'express';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// TODO: Import and mount route modules as they are implemented
// import authRoutes from './auth.js';
// import albumRoutes from './albums.js';
// import photoRoutes from './photos.js';
// import userRoutes from './users.js';
// import galleryRoutes from './gallery.js';

// router.use('/auth', authRoutes);
// router.use('/albums', albumRoutes);
// router.use('/photos', photoRoutes);
// router.use('/users', userRoutes);
// router.use('/gallery', galleryRoutes);

export default router;
