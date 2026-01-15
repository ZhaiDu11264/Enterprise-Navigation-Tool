import axios from 'axios';

// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      error.code = 'NETWORK_ERROR';
      error.message = 'Network Error: Please check your connection';
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Handle rate limiting errors
    if (status === 429) {
      error.code = 'RATE_LIMIT_EXCEEDED';
      error.message = 'Too many requests. Please wait a moment and try again.';
      return Promise.reject(error);
    }

    // Handle authentication errors
    if (status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Clear all caches to prevent data leakage when token expires
      try {
        // Dynamic import to avoid circular dependencies
        import('../utils/cache').then(({ cache, persistentCache }) => {
          cache.clear();
          persistentCache.clear();
        }).catch(err => {
          console.warn('Failed to clear caches on 401:', err);
        });
      } catch (error) {
        console.warn('Failed to import cache modules on 401:', error);
      }
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Enhance error with structured data
    if (data?.error) {
      error.code = data.error.code;
      error.message = data.error.message;
      error.requestId = data.error.requestId;
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// API response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId: string;
  };
}

// Generic API methods
export const api = {
  get: <T = any>(url: string) =>
    apiClient.get<T>(url),
  
  post: <T = any>(url: string, data?: any) =>
    apiClient.post<T>(url, data),
  
  put: <T = any>(url: string, data?: any) =>
    apiClient.put<T>(url, data),
  
  delete: <T = any>(url: string) =>
    apiClient.delete<T>(url),
  
  patch: <T = any>(url: string, data?: any) =>
    apiClient.patch<T>(url, data),
};
