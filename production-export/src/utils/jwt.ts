import jwt, { SignOptions } from 'jsonwebtoken';
import { StringValue } from 'ms';
import config from '../config/environment';
import { User } from '../models/interfaces';

export interface JWTPayload {
  userId: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  iat?: number;
  exp?: number;
  aud?: string;
  iss?: string;
}

export interface TokenResult {
  success: boolean;
  token?: string;
  payload?: JWTPayload;
  message?: string;
}

export class JWTService {
  private static readonly SECRET = config.jwtSecret;
  private static readonly EXPIRES_IN: StringValue = config.jwtExpiresIn as StringValue || '24h';

  /**
   * Generate JWT token for authenticated user
   */
  static generateToken(user: User): TokenResult {
    try {
      const payload: JWTPayload = {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      };

      const options: SignOptions = {
        expiresIn: this.EXPIRES_IN,
        issuer: 'enterprise-navigation-tool',
        audience: 'enterprise-navigation-users'
      };

      const token = jwt.sign(payload, this.SECRET, options);

      return {
        success: true,
        token,
        payload
      };
    } catch (error) {
      console.error('JWT generation error:', error);
      return {
        success: false,
        message: 'Failed to generate token'
      };
    }
  }

  /**
   * Verify and decode JWT token
   */
  static verifyToken(token: string): TokenResult {
    try {
      const decoded = jwt.verify(token, this.SECRET, {
        issuer: 'enterprise-navigation-tool',
        audience: 'enterprise-navigation-users'
      }) as JWTPayload;

      return {
        success: true,
        payload: decoded
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return {
          success: false,
          message: 'Token expired'
        };
      } else if (error instanceof jwt.JsonWebTokenError) {
        return {
          success: false,
          message: 'Invalid token'
        };
      } else {
        console.error('JWT verification error:', error);
        return {
          success: false,
          message: 'Token verification failed'
        };
      }
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1] || null;
  }

  /**
   * Refresh token (generate new token with updated expiration)
   */
  static refreshToken(currentToken: string): TokenResult {
    const verifyResult = this.verifyToken(currentToken);
    
    if (!verifyResult.success || !verifyResult.payload) {
      return verifyResult;
    }

    // Create new payload without iat, exp, aud, and iss
    const { iat, exp, aud, iss, ...payload } = verifyResult.payload;
    
    const options: SignOptions = {
      expiresIn: this.EXPIRES_IN,
      issuer: 'enterprise-navigation-tool',
      audience: 'enterprise-navigation-users'
    };

    try {
      const newToken = jwt.sign(payload, this.SECRET, options);

      return {
        success: true,
        token: newToken,
        payload: verifyResult.payload
      };
    } catch (error) {
      console.error('JWT refresh error:', error);
      return {
        success: false,
        message: 'Failed to refresh token'
      };
    }
  }
}