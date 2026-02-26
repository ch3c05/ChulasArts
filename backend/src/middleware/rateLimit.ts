/**
 * Rate Limiting Middleware
 *
 * Prevents abuse by limiting request rates
 * Different limits for different endpoint types
 */

import rateLimit from 'express-rate-limit';

// Use higher limits in development
const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * General API rate limiter
 * Development: 1000 requests per 15 minutes per IP
 * Production: 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 100,
  message: { success: false, error: 'Too many requests from this IP, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests from this IP, please try again later',
    });
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * Development: 50 requests per 15 minutes per IP
 * Production: 5 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 50 : 5,
  message: { success: false, error: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many authentication attempts, please try again later',
    });
  },
});

/**
 * Rate limiter for file uploads
 * Development: 200 uploads per hour per IP
 * Production: 20 uploads per hour per IP
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDevelopment ? 200 : 20,
  message: { success: false, error: 'Too many uploads, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many uploads, please try again later',
    });
  },
});

/**
 * Generous rate limiter for public gallery browsing
 * Development: 2000 requests per 15 minutes per IP
 * Production: 200 requests per 15 minutes per IP
 */
export const galleryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 2000 : 200,
  message: { success: false, error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later',
    });
  },
});
