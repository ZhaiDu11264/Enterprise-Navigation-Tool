import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// Development-friendly CORS configuration
export const devCorsMiddleware = cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
});

// Relaxed helmet for development
export const devHelmetMiddleware = helmet({
  contentSecurityPolicy: false, // Disable CSP in development
  crossOriginEmbedderPolicy: false,
});

// Very lenient rate limiting for development
export const devRateLimitMiddleware = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10000, // Very high limit for development
  message: {
    error: 'Rate limit exceeded in development mode.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and static files
    return req.path === '/health' || req.path.startsWith('/uploads');
  }
});

// No-op rate limiting (essentially disabled)
export const noRateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
  next();
};

// Development request logger with more details
export const devRequestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  console.log(`🔄 ${req.method} ${req.originalUrl} - Started`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m'; // Red for errors, green for success
    const resetColor = '\x1b[0m';
    
    console.log(
      `${statusColor}✓ ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms${resetColor}`
    );
  });
  
  next();
};