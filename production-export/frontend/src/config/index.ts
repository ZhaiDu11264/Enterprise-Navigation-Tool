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
  links: {
    footerContactUrl: process.env.REACT_APP_FOOTER_CONTACT_URL || 'https://f.wps.cn/g/gFXZeyYH',
    footerIcpUrl: process.env.REACT_APP_FOOTER_ICP_URL || 'https://beian.miit.gov.cn/',
    faviconFallbackTemplate:
      process.env.REACT_APP_FAVICON_FALLBACK_URL ||
      'https://www.google.com/s2/favicons?domain={domain}&sz=32',
    defaultFaviconPath: process.env.REACT_APP_DEFAULT_FAVICON_PATH || '/default-favicon.png',
  },
  ui: {
    cardsPerPage: 20,
    searchDebounceMs: 300,
    defaultViewMode: 'grid' as const,
  },
};

export default config;
