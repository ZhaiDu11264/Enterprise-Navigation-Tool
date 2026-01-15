import { api } from './api';
import apiClient from './api';

interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

interface FaviconExtractionResult {
  faviconUrl?: string;
  iconUrl?: string;
  success?: boolean;
}

export const faviconService = {
  // Extract favicon from URL
  async extractFavicon(url: string): Promise<string | null> {
    try {
      const response = await api.post<ApiResponse<FaviconExtractionResult>>('/favicon/extract', { url });
      const data = response.data.data;
      if (data.success === false) {
        return null;
      }
      const iconUrl = data.faviconUrl || data.iconUrl || null;
      if (iconUrl) {
        return iconUrl;
      }
    } catch (error) {
      console.warn('Failed to extract favicon:', error);
    }

    const domain = faviconService.extractDomain(url);
    if (!domain) {
      return null;
    }

    try {
      const response = await api.get<ApiResponse<{ faviconUrl: string }>>(`/favicon/domain/${domain}`);
      return response.data.data.faviconUrl || null;
    } catch (error) {
      console.warn('Failed to fetch domain favicon:', error);
      return null;
    }
  },

  // Upload custom icon
  async uploadIcon(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('icon', file);
    
    // Use axios directly for file upload with custom headers
    const response = await apiClient.post<ApiResponse<{ iconUrl: string }>>('/favicon/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.data.iconUrl;
  },

  // Get default icon URL
  getDefaultIconUrl(): string {
    return '/icons/default-favicon.svg';
  },

  // Get predefined icon options
  getPredefinedIcons(): { name: string; url: string }[] {
    return [
      { name: 'Default', url: '/icons/default-favicon.svg' },
      { name: 'Globe', url: '/icons/globe-icon.svg' },
      { name: 'Link', url: '/icons/link-icon.svg' },
      { name: 'Website', url: '/icons/website-icon.svg' },
    ];
  },

  // Validate icon file
  validateIconFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 2 * 1024 * 1024; // 2MB
    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
      return { isValid: false, error: 'File size must be less than 2MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'File must be PNG, JPEG, SVG, GIF, or WebP' };
    }

    return { isValid: true };
  },

  extractDomain(url: string): string | null {
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      return parsed.hostname;
    } catch {
      return null;
    }
  }
};
