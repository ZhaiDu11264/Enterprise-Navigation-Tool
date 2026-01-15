import { api } from './api';
import { User, AuthResult, LoginRequest, CreateUserRequest } from '../types';
import config from '../config';
import { normalizeUser } from '../utils/user';

export class AuthService {
  private static instance: AuthService;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Login user
  async login(credentials: LoginRequest): Promise<AuthResult> {
    try {
      // Clear any existing caches before login to prevent data mixing
      try {
        const { cache, persistentCache } = await import('../utils/cache');
        cache.clear();
        persistentCache.clear();
      } catch (error) {
        console.warn('Failed to clear caches during login:', error);
      }
      
      const response = await api.post<AuthResult>('/auth/login', credentials);
      const responseData = response.data as any;
      const { user, token } = responseData.data || responseData;
      const normalizedUser = normalizeUser(user);
      
      // Store token and user in localStorage
      localStorage.setItem(config.auth.tokenKey, token);
      localStorage.setItem(config.auth.userKey, JSON.stringify(normalizedUser));
      
      return { user: normalizedUser as User, token };
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Login failed');
    }
  }

  // Register user
  async register(payload: CreateUserRequest): Promise<User> {
    try {
      const response = await api.post('/auth/register', payload);
      const responseData = response.data as any;
      const user = responseData?.data?.user || responseData?.user || responseData?.data;
      return normalizeUser(user) as User;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Registration failed');
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem(config.auth.tokenKey);
      localStorage.removeItem(config.auth.userKey);
      
      // Clear all caches to prevent data leakage between users
      try {
        const { cache, persistentCache } = await import('../utils/cache');
        cache.clear();
        persistentCache.clear();
      } catch (error) {
        console.warn('Failed to clear caches during logout:', error);
      }
    }
  }

  // Get current user from localStorage
  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem(config.auth.userKey);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  }

  // Get current token
  getToken(): string | null {
    return localStorage.getItem(config.auth.tokenKey);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  // Check if user is admin
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  // Refresh user info
  async refreshUser(): Promise<User> {
    try {
      const response = await api.get<User>('/auth/me');
      const responseData = response.data as any;
      const user = responseData?.data?.user || responseData?.data || responseData;
      const normalizedUser = normalizeUser(user);
      
      // Update user in localStorage
      localStorage.setItem(config.auth.userKey, JSON.stringify(normalizedUser));
      
      return normalizedUser as User;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to refresh user');
    }
  }

  // Clear authentication data
  clearAuth(): void {
    localStorage.removeItem(config.auth.tokenKey);
    localStorage.removeItem(config.auth.userKey);
    
    // Clear all caches to prevent data leakage
    try {
      import('../utils/cache').then(({ cache, persistentCache }) => {
        cache.clear();
        persistentCache.clear();
      }).catch(err => {
        console.warn('Failed to clear caches in clearAuth:', err);
      });
    } catch (error) {
      console.warn('Failed to import cache modules in clearAuth:', error);
    }
  }
}

export default AuthService.getInstance();
