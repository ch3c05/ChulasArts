/**
 * Express Server Entry Point
 *
 * Initializes Express application with middleware and routes
 * Connects to MongoDB and starts the server
 */

// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { corsMiddleware } from './config/cors.js';
import { securityMiddleware } from './middleware/security.js';
import { getLogger } from './middleware/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimit.js';
import routes from './routes/index.js';

// Load environment variables
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Create and configure Express application
 */
function createApp(): Application {
  const app = express();

  // Security middleware (helmet)
  app.use(securityMiddleware);

  // CORS configuration
  app.use(corsMiddleware);

  // Request logging (morgan)
  app.use(getLogger());

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Cookie parsing
  app.use(cookieParser());

  // Rate limiting (apply to all API routes)
  app.use('/api', apiLimiter);

  // API routes
  app.use('/api', routes);

  // 404 handler (must be after all routes)
  app.use(notFoundHandler);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}

/**
 * Start the Express server
 */
async function startServer(): Promise<void> {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await connectDatabase();
    console.log('✓ MongoDB connected');

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT} in ${NODE_ENV} mode`);
      console.log(`✓ API available at http://localhost:${PORT}/api`);
    });

    // Graceful shutdown handling
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received, shutting down gracefully...`);

      // Stop accepting new connections
      server.close(() => {
        console.log('✓ HTTP server closed');
      });

      // Disconnect from MongoDB
      await disconnectDatabase();
      console.log('✓ MongoDB disconnected');

      process.exit(0);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export { createApp, startServer };
