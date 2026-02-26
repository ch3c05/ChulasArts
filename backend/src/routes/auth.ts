/**
 * Authentication Routes
 * Handles user signup, login, logout, profile, and token refresh
 */

import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { register, login, getUserById, updateProfile } from '../services/authService';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { verifyToken } from '../utils/jwt';
import { generateAccessToken } from '../utils/jwt';
import { generateAvatarSignedUrl } from '../services/azureService.js';

const router = Router();

/**
 * POST /api/auth/signup
 * Create new user account
 */
router.post(
  '/signup',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8, max: 100 })
      .withMessage('Password must be between 8 and 100 characters'),
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, name } = req.body;

      const { user, accessToken, refreshToken } = await register({
        email,
        password,
        name,
      });

      // Set httpOnly cookies
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Generate signed URL for avatar if it exists
      const avatarUrl = user.avatarUrl
        ? await generateAvatarSignedUrl(user.avatarUrl)
        : user.avatarUrl;

      res.status(201).json({
        id: user._id,
        email: user.email,
        name: user.name,
        bio: user.bio,
        avatarUrl,
        createdAt: user.createdAt,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/login
 * Login to existing account
 */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      const { user, accessToken, refreshToken } = await login({
        email,
        password,
      });

      // Set httpOnly cookies
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Generate signed URL for avatar if it exists
      const avatarUrl = user.avatarUrl
        ? await generateAvatarSignedUrl(user.avatarUrl)
        : user.avatarUrl;

      res.status(200).json({
        id: user._id,
        email: user.email,
        name: user.name,
        bio: user.bio,
        avatarUrl,
        createdAt: user.createdAt,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/logout
 * Logout current session
 */
router.post('/logout', authenticate, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const user = await getUserById(userId);
    if (!user) {
      res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
      return;
    }

    // Generate signed URL for avatar if it exists
    const avatarUrl = user.avatarUrl
      ? await generateAvatarSignedUrl(user.avatarUrl)
      : user.avatarUrl;

    res.status(200).json({
      id: user._id,
      email: user.email,
      name: user.name,
      bio: user.bio,
      avatarUrl,
      createdAt: user.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Refresh token not found',
      });
      return;
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken);

    if (decoded.type !== 'refresh') {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token type',
      });
      return;
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(decoded.userId, decoded.email);

    // Set new access token cookie
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.status(200).json({ message: 'Token refreshed' });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/auth/profile
 * Update current user profile
 */
router.patch(
  '/profile',
  authenticate,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('bio')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Bio must be at most 1000 characters'),
    body('avatarUrl').optional().isURL().withMessage('Avatar URL must be a valid URL'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { name, bio, avatarUrl } = req.body;

      const user = await updateProfile(userId, { name, bio, avatarUrl });

      if (!user) {
        res.status(404).json({
          error: 'Not Found',
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        id: user._id,
        email: user.email,
        name: user.name,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
