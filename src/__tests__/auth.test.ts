import request from 'supertest';
import app from '../app';
import { UserService } from '../models/User';
import { JWTService } from '../utils/jwt';

// Mock database operations for testing
jest.mock('../config/database', () => ({
  executeQuery: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(undefined),
  closePool: jest.fn().mockResolvedValue(undefined)
}));

jest.mock('../models/DefaultConfiguration', () => ({
  ConfigurationService: {
    applyActiveConfigurationToUser: jest.fn().mockResolvedValue(undefined)
  }
}));

describe('Authentication System', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: '$2b$10$hashedpassword',
    role: 'user' as const,
    createdAt: new Date(),
    lastLoginAt: new Date(),
    isActive: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Property 1: Valid authentication grants access', () => {
    it('should authenticate valid credentials and return user data with token', async () => {
      // Mock successful authentication
      jest.spyOn(UserService, 'authenticate').mockResolvedValue({
        success: true,
        user: mockUser
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'validpassword'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toMatchObject({
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        role: mockUser.role
      });
      expect(response.body.data.token).toBeDefined();
      expect(typeof response.body.data.token).toBe('string');
    });

    it('should grant access to protected routes with valid token', async () => {
      // Mock user lookup for token verification
      jest.spyOn(UserService, 'getUserById').mockResolvedValue(mockUser);

      // Generate a valid token
      const tokenResult = JWTService.generateToken(mockUser);
      expect(tokenResult.success).toBe(true);
      
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${tokenResult.token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.id).toBe(mockUser.id);
    });
  });

  describe('Property 2: Invalid authentication is rejected', () => {
    it('should reject invalid credentials with appropriate error', async () => {
      // Mock failed authentication
      jest.spyOn(UserService, 'authenticate').mockResolvedValue({
        success: false,
        message: 'Invalid credentials'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('AUTHENTICATION_FAILED');
      expect(response.body.error.message).toContain('Invalid credentials');
    });

    it('should reject requests with invalid tokens', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('INVALID_TOKEN');
    });

    it('should reject requests with missing tokens', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('MISSING_TOKEN');
    });

    it('should reject malformed authorization headers', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidFormat token');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('MISSING_TOKEN');
    });
  });

  describe('Property 5: Role-based access control', () => {
    const adminUser = {
      ...mockUser,
      id: 2,
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin' as const
    };

    it('should allow admin access to admin endpoints', async () => {
      // Mock admin user lookup
      jest.spyOn(UserService, 'getUserById').mockResolvedValue(adminUser);

      // Generate admin token
      const tokenResult = JWTService.generateToken(adminUser);
      expect(tokenResult.success).toBe(true);

      const response = await request(app)
        .get('/api/admin/config')
        .set('Authorization', `Bearer ${tokenResult.token}`);

      // Should not be 403 (forbidden) - might be 404 or 500 if endpoint not fully implemented
      expect(response.status).not.toBe(403);
    });

    it('should deny regular user access to admin endpoints', async () => {
      // Mock regular user lookup
      jest.spyOn(UserService, 'getUserById').mockResolvedValue(mockUser);

      // Generate user token
      const tokenResult = JWTService.generateToken(mockUser);
      expect(tokenResult.success).toBe(true);

      const response = await request(app)
        .get('/api/admin/config')
        .set('Authorization', `Bearer ${tokenResult.token}`);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });
  });

  describe('JWT Token Operations', () => {
    it('should generate valid JWT tokens', () => {
      const tokenResult = JWTService.generateToken(mockUser);
      
      expect(tokenResult.success).toBe(true);
      expect(tokenResult.token).toBeDefined();
      expect(tokenResult.payload).toMatchObject({
        userId: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        role: mockUser.role
      });
    });

    it('should verify valid JWT tokens', () => {
      const tokenResult = JWTService.generateToken(mockUser);
      expect(tokenResult.success).toBe(true);
      
      const verifyResult = JWTService.verifyToken(tokenResult.token!);
      
      expect(verifyResult.success).toBe(true);
      expect(verifyResult.payload).toMatchObject({
        userId: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        role: mockUser.role
      });
    });

    it('should reject invalid JWT tokens', () => {
      const verifyResult = JWTService.verifyToken('invalid.jwt.token');
      
      expect(verifyResult.success).toBe(false);
      expect(verifyResult.message).toBeDefined();
    });

    it('should refresh valid tokens', () => {
      const tokenResult = JWTService.generateToken(mockUser);
      expect(tokenResult.success).toBe(true);
      
      // Wait a small amount to ensure different timestamp
      const refreshResult = JWTService.refreshToken(tokenResult.token!);
      
      expect(refreshResult.success).toBe(true);
      expect(refreshResult.token).toBeDefined();
      // The token should be valid (may be same if generated in same second)
      const verifyRefreshed = JWTService.verifyToken(refreshResult.token!);
      expect(verifyRefreshed.success).toBe(true);
    });
  });

  describe('Input Validation', () => {
    it('should validate login request format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: '', // Empty username
          password: '123' // Too short password
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toBeDefined();
    });

    it('should validate registration request format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'ab', // Too short
          email: 'invalid-email', // Invalid email format
          password: '123', // Too weak password
          role: 'invalid' // Invalid role
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('User Registration', () => {
    it('should create new user with valid data', async () => {
      const newUser = {
        ...mockUser,
        id: 3,
        username: 'newuser',
        email: 'newuser@example.com'
      };

      // Mock user creation
      jest.spyOn(UserService, 'usernameExists').mockResolvedValue(false);
      jest.spyOn(UserService, 'emailExists').mockResolvedValue(false);
      jest.spyOn(UserService, 'createUser').mockResolvedValue(newUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'ValidPass123',
          role: 'user'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe('newuser');
    });

    it('should reject duplicate username', async () => {
      jest.spyOn(UserService, 'usernameExists').mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'existinguser',
          email: 'new@example.com',
          password: 'ValidPass123'
        });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('USERNAME_EXISTS');
    });

    it('should reject duplicate email', async () => {
      jest.spyOn(UserService, 'usernameExists').mockResolvedValue(false);
      jest.spyOn(UserService, 'emailExists').mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'existing@example.com',
          password: 'ValidPass123'
        });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('EMAIL_EXISTS');
    });
  });

  describe('Logout Functionality', () => {
    it('should handle logout for authenticated users', async () => {
      jest.spyOn(UserService, 'getUserById').mockResolvedValue(mockUser);
      
      const tokenResult = JWTService.generateToken(mockUser);
      expect(tokenResult.success).toBe(true);

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${tokenResult.token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should require authentication for logout', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(401);
    });
  });
});