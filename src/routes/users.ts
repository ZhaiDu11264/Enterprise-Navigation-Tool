import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { promises as fs } from 'fs';
import path from 'path';
import multer from 'multer';
import config from '../config/environment';
import { authenticateToken } from '../middleware/auth';
import { UserService } from '../models/User';
import { logAudit } from '../utils/audit';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxFileSize }
});

// Get current user profile
router.get('/profile',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const user = await UserService.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      // Return user data without password hash
      const { passwordHash, ...userProfile } = user;
      
      return res.status(200).json({
        user: userProfile
      });

    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Update user profile
router.put('/profile',
  authenticateToken,
  [
    body('email')
      .optional()
      .isEmail()
      .withMessage('Email must be valid'),
    body('username')
      .optional()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters'),
    body('displayName')
      .optional()
      .isLength({ min: 0, max: 80 })
      .withMessage('Display name must be between 0 and 80 characters'),
    body('avatarUrl')
      .optional()
      .custom((value) => value === null || typeof value === 'string')
      .withMessage('Avatar URL must be a string'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const userId = req.user!.userId;
      const { email, username, displayName, avatarUrl } = req.body;

      const updates: any = {};
      if (email) updates.email = email;
      if (username) updates.username = username;
      if (displayName !== undefined) {
        const normalizedDisplayName = String(displayName).trim();
        updates.displayName = normalizedDisplayName.length > 0 ? normalizedDisplayName : null;
      }
      if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          error: 'No valid fields to update'
        });
      }

      const updatedUser = await UserService.updateUser(userId, updates);
      
      // Return user data without password hash
      const { passwordHash, ...userProfile } = updatedUser;

      await logAudit(req, {
        userId,
        action: 'profile.update',
        entityType: 'user',
        entityId: userId,
        description: 'Updated profile'
      });
      
      return res.status(200).json({
        message: 'Profile updated successfully',
        user: userProfile
      });

    } catch (error) {
      console.error('Update profile error:', error);
      
      if (error instanceof Error && error.message.includes('duplicate')) {
        return res.status(409).json({
          error: 'Username or email already exists'
        });
      }
      
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Upload user avatar
router.post('/avatar',
  authenticateToken,
  upload.single('avatar'),
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      if (!req.file.mimetype.startsWith('image/')) {
        return res.status(400).json({ error: 'Only image files are allowed' });
      }

      const ext = path.extname(req.file.originalname || '').toLowerCase() || '.png';
      const fileName = `avatar-${req.user.userId}-${Date.now()}${ext}`;
      const avatarDir = path.join(config.uploadDir, 'avatars');
      const uploadPath = path.join(avatarDir, fileName);

      await fs.mkdir(avatarDir, { recursive: true });
      await fs.writeFile(uploadPath, req.file.buffer);

      const avatarUrl = `/uploads/avatars/${fileName}`;
      const updatedUser = await UserService.updateUser(req.user.userId, { avatarUrl });
      const { passwordHash, ...userProfile } = updatedUser;

      await logAudit(req, {
        userId: req.user.userId,
        action: 'profile.avatar.update',
        entityType: 'user',
        entityId: req.user.userId,
        description: 'Updated avatar'
      });

      return res.status(200).json({
        message: 'Avatar updated successfully',
        avatarUrl,
        user: userProfile
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;
