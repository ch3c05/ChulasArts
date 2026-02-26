/**
 * User Routes
 * User profile endpoints
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/errors.js';
import { uploadAvatarToAzure, generateAvatarSignedUrl } from '../services/azureService.js';
import { resizeImage } from '../services/imageService.js';

const router = Router();

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for avatars
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

/**
 * POST /api/users/avatar
 * Upload user avatar
 */
router.post(
  '/avatar',
  authenticate,
  upload.single('avatar'),
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const file = req.file;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!file) {
        throw new AppError('Avatar file is required', 400);
      }

      // Resize image to 400x400
      const resizedBuffer = await resizeImage(file.buffer, 400, 400);

      // Upload to Azure Blob Storage (avatars container) and get signed URL
      const filename = `${userId}-${Date.now()}.jpg`;
      const { blobUrl, signedUrl } = await uploadAvatarToAzure(
        filename,
        resizedBuffer,
        'image/jpeg'
      );

      // Update user avatar with blob URL (we'll generate signed URLs on read)
      const user = await User.findByIdAndUpdate(
        userId,
        { avatarUrl: blobUrl },
        { new: true }
      ).select('-password');

      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.json({
        success: true,
        data: {
          avatarUrl: signedUrl, // Return signed URL to client
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, error: error.message });
      } else {
        console.error('Avatar upload error:', error);
        res.status(500).json({ success: false, error: 'Failed to upload avatar' });
      }
    }
  }
);

/**
 * PATCH /api/users/profile
 * Update current user profile
 */
router.patch('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { name, bio, avatarUrl } = req.body;

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new AppError('Name is required', 400);
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      {
        name: name.trim(),
        bio: bio ? bio.trim() : '',
        ...(avatarUrl && { avatarUrl }),
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Generate signed URL for avatar if it exists
    const avatarSignedUrl = user.avatarUrl
      ? await generateAvatarSignedUrl(user.avatarUrl)
      : undefined;

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          bio: user.bio,
          avatarUrl: avatarSignedUrl || user.avatarUrl,
          albumCount: user.albumCount,
        },
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      console.error('Update profile error:', error);
      res.status(500).json({ success: false, error: 'Failed to update profile' });
    }
  }
});

/**
 * GET /api/users/:username
 * Get user profile by username
 */
router.get('/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ name: username }).select('-password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Generate signed URL for avatar if it exists
    const avatarSignedUrl = user.avatarUrl
      ? await generateAvatarSignedUrl(user.avatarUrl)
      : undefined;

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          bio: user.bio,
          avatarUrl: avatarSignedUrl || user.avatarUrl,
          albumCount: user.albumCount,
        },
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      console.error('Get user error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch user' });
    }
  }
});

// TODO: Implement additional user routes
// GET /api/users/:username/albums - Get user's public albums
// GET /api/users/me/bookmarks - Get current user's bookmarked photos

export default router;
