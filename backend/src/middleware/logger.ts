/**
 * HTTP Request Logging Middleware
 *
 * Configures Morgan logger for HTTP request logging
 * Different formats for development and production
 */

import morgan from 'morgan';

/**
 * Morgan logging middleware for development
 * Uses 'dev' format with colored output
 */
export const developmentLogger = morgan('dev');

/**
 * Morgan logging middleware for production
 * Uses 'combined' format (Apache combined log format)
 */
export const productionLogger = morgan('combined');

/**
 * Get appropriate logger based on environment
 */
export function getLogger() {
  return process.env.NODE_ENV === 'production' ? productionLogger : developmentLogger;
}
