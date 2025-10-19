/**
 * Security Middleware
 *
 * Configures Helmet security headers for Express application
 * Protects against common web vulnerabilities
 */

import helmet from 'helmet';

/**
 * Helmet security middleware configuration
 * Sets various HTTP headers to secure the application
 */
export const securityMiddleware = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  // Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  // Disable X-Powered-By header
  hidePoweredBy: true,
  // Prevent clickjacking
  frameguard: {
    action: 'deny',
  },
  // Prevent MIME type sniffing
  noSniff: true,
  // XSS Protection
  xssFilter: true,
});
