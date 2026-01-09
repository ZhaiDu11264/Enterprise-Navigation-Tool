import dotenv from 'dotenv';

dotenv.config();

interface EnvironmentConfig {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  uploadDir: string;
  maxFileSize: number;
  redisHost: string;
  redisPort: number;
  redisPassword: string;
  faviconCacheTtl: number;
  faviconTimeout: number;
}

const config: EnvironmentConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
  redisPassword: process.env.REDIS_PASSWORD || '',
  faviconCacheTtl: parseInt(process.env.FAVICON_CACHE_TTL || '86400', 10), // 24 hours
  faviconTimeout: parseInt(process.env.FAVICON_TIMEOUT || '5000', 10), // 5 seconds
};

// Validate required environment variables
const validateConfig = (): void => {
  const requiredVars = ['JWT_SECRET'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
    console.warn('Using fallback values for development');
  }
  
  if (config.nodeEnv === 'production' && config.jwtSecret === 'fallback-secret-key') {
    throw new Error('JWT_SECRET must be set in production environment');
  }
};

validateConfig();

export default config;