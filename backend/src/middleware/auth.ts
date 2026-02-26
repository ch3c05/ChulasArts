/**
 * Authentication Middleware
 *
 * Verifies JWT tokens and attaches user info to requests
 * Protects routes that require authentication
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt.js';
import { UnauthorizedError } from '../utils/errors.js';

// Extend Express Request interface to include user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header or cookies
 * Attaches user info to req.user
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Try to get token from Authorization header
    let token = extractTokenFromHeader(req.headers.authorization);

    // Fallback to accessToken cookie if no header token
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new UnauthorizedError('No authentication token provided');
    }

    // Verify token
    const decoded = verifyToken(token);

    // Ensure it's an access token (not refresh token)
    if (decoded.type !== 'access') {
      throw new UnauthorizedError('Invalid token type');
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication middleware
 * Attaches user info if token is present, but doesn't fail if missing
 * Useful for endpoints that behave differently for authenticated users
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Try to get token from Authorization header
    let token = extractTokenFromHeader(req.headers.authorization);

    // Fallback to accessToken cookie if no header token
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    // If no token, just continue without user info
    if (!token) {
      next();
      return;
    }

    // Verify token
    const decoded = verifyToken(token);

    // Ensure it's an access token
    if (decoded.type === 'access') {
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
      };
    }

    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
}

/**
 * Require ownership middleware
 * Verifies that authenticated user owns the resource
 * Must be used after authenticate() middleware
 */
export function requireOwnership(resourceUserIdField: string = 'userId') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];

    if (!resourceUserId) {
      throw new UnauthorizedError('Resource ownership cannot be determined');
    }

    if (req.user.userId !== resourceUserId) {
      throw new UnauthorizedError('You do not have permission to access this resource');
    }

    next();
  };
}
