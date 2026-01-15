// Application configuration
export const config = {
  api: {
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
    timeout: 10000,
  },
  app: {
    name: process.env.REACT_APP_NAME || 'Enterprise Navigation Tool',
    version: process.env.REACT_APP_VERSION || '1.0.0',
  },
  auth: {
    tokenKey: 'authToken',
    userKey: 'user',
  },
  ui: {
    cardsPerPage: 20,
    searchDebounceMs: 300,
    defaultViewMode: 'grid' as const,
  },
};

export default config;