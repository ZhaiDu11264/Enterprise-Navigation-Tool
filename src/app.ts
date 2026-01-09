import express, { Application } from 'express';
import { corsMiddleware, helmetMiddleware, rateLimitMiddleware, requestLogger } from './middleware/security';
import { devCorsMiddleware, devHelmetMiddleware, noRateLimitMiddleware, devRequestLogger } from './middleware/devSecurity';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import config from './config/environment';
import apiRoutes from './routes';

// Create Express application
const app: Application = express();

// Force development mode for now to disable rate limiting
const isDevelopment = config.nodeEnv === 'development' || !process.env.NODE_ENV || process.env.NODE_ENV !== 'production';

console.log(`🌍 Environment: ${config.nodeEnv}`);
console.log(`🔧 Development mode: ${isDevelopment}`);

// Security middleware - completely disable rate limiting in development
if (isDevelopment) {
  console.log('🔧 Development mode: Rate limiting disabled');
  app.use(devHelmetMiddleware);
  app.use(devCorsMiddleware);
  // No rate limiting middleware in development
} else {
  console.log('🔒 Production mode: Security enabled');
  app.use(helmetMiddleware);
  app.use(corsMiddleware);
  app.use(rateLimitMiddleware);
}

// Request logging
if (isDevelopment) {
  app.use(devRequestLogger);
} else {
  app.use(requestLogger);
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    version: process.env.npm_package_version || '1.0.0',
  });
});

// API routes will be added here in future tasks
app.use('/api', apiRoutes);

// Static file serving for uploads
app.use('/uploads', express.static(config.uploadDir));

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;