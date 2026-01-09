import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { UserService } from '../models/User';

const router = Router();

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
      const { email, username } = req.body;

      const updates: any = {};
      if (email) updates.email = email;
      if (username) updates.username = username;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          error: 'No valid fields to update'
        });
      }

      const updatedUser = await UserService.updateUser(userId, updates);
      
      // Return user data without password hash
      const { passwordHash, ...userProfile } = updatedUser;
      
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

export default router;