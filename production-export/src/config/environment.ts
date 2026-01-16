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
  corsOrigins: string[];
  corsAllowCredentials: boolean;
  faviconDefaultIconPath: string;
  faviconFallbackIcons: string[];
  faviconExternalFallbacks: string[];
}

const parseCsv = (value: string | undefined): string[] | undefined => {
  if (!value) {
    return undefined;
  }
  const items = value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
  return items.length > 0 ? items : undefined;
};

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) {
    return fallback;
  }
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

const nodeEnv = process.env.NODE_ENV || 'development';
const defaultCorsOrigins =
  nodeEnv === 'production'
    ? ['https://yourdomain.com']
    : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'];

const config: EnvironmentConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv,
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
  redisPassword: process.env.REDIS_PASSWORD || '',
  faviconCacheTtl: parseInt(process.env.FAVICON_CACHE_TTL || '86400', 10), // 24 hours
  faviconTimeout: parseInt(process.env.FAVICON_TIMEOUT || '5000', 10), // 5 seconds
  corsOrigins: parseCsv(process.env.CORS_ORIGINS) || defaultCorsOrigins,
  corsAllowCredentials: parseBoolean(process.env.CORS_ALLOW_CREDENTIALS, true),
  faviconDefaultIconPath: process.env.FAVICON_DEFAULT_ICON_PATH || '/uploads/icons/default-favicon.svg',
  faviconFallbackIcons: parseCsv(process.env.FAVICON_FALLBACK_ICONS) || [
    '/uploads/icons/website-icon.svg',
    '/uploads/icons/link-icon.svg',
    '/uploads/icons/globe-icon.svg'
  ],
  faviconExternalFallbacks: parseCsv(process.env.FAVICON_EXTERNAL_FALLBACKS) || [
    'https://www.google.com/s2/favicons?domain={domain}&sz=128',
    'https://icons.duckduckgo.com/ip3/{domain}.ico'
  ]
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
