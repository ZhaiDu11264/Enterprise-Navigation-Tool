import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';
import path from 'path';
import fs from 'fs/promises';
import config from '../config/environment';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface FaviconCacheRow extends RowDataPacket {
  id: number;
  domain: string;
  icon_url: string;
  cached_at: Date;
  expires_at: Date;
}

export interface FaviconService {
  extractFavicon(url: string): Promise<string>;
  cacheFavicon(domain: string, iconUrl: string): Promise<string>;
  getFaviconUrl(domain: string): Promise<string>;
  uploadCustomIcon(file: Express.Multer.File): Promise<string>;
  getDefaultIcon(): string;
}

class FaviconServiceImpl implements FaviconService {
  private readonly defaultIconPath = '/uploads/icons/default-favicon.svg';
  private readonly fallbackIcons = [
    '/uploads/icons/website-icon.svg',
    '/uploads/icons/link-icon.svg',
    '/uploads/icons/globe-icon.svg'
  ];
  private readonly externalFallbacks = [
    (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
    (domain: string) => `https://icons.duckduckgo.com/ip3/${domain}.ico`
  ];

  /**
   * Extract favicon from a given URL
   */
  async extractFavicon(url: string): Promise<string> {
    try {
      const domain = this.extractDomain(url);
      
      // Check cache first
      const cachedIcon = await this.getCachedFavicon(domain);
      if (cachedIcon) {
        return cachedIcon;
      }

      // Try multiple extraction strategies
      const candidates = await this.buildCandidateUrls(url);
      const faviconUrl = await this.findFirstValidIcon(candidates);
      
      if (faviconUrl) {
        // Cache the result
        await this.cacheFavicon(domain, faviconUrl);
        return faviconUrl;
      }

      // External fallback services
      const externalCandidates = this.externalFallbacks.map(builder => builder(domain));
      const externalIcon = await this.findFirstValidIcon(externalCandidates);
      if (externalIcon) {
        await this.cacheFavicon(domain, externalIcon);
        return externalIcon;
      }

      // Return default icon if extraction fails
      return this.getDefaultIcon();
    } catch (error) {
      console.error('Error extracting favicon:', error);
      return this.getDefaultIcon();
    }
  }

  /**
   * Cache favicon URL for a domain
   */
  async cacheFavicon(domain: string, iconUrl: string): Promise<string> {
    try {
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + config.faviconCacheTtl);

      const query = `
        INSERT INTO favicon_cache (domain, icon_url, expires_at)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
        icon_url = VALUES(icon_url),
        cached_at = CURRENT_TIMESTAMP,
        expires_at = VALUES(expires_at)
      `;

      await pool.execute(query, [domain, iconUrl, expiresAt]);
      return iconUrl;
    } catch (error) {
      console.error('Error caching favicon:', error);
      return iconUrl; // Return the URL even if caching fails
    }
  }

  /**
   * Get favicon URL for a domain (from cache or extract)
   */
  async getFaviconUrl(domain: string): Promise<string> {
    try {
      // Check cache first
      const cachedIcon = await this.getCachedFavicon(domain);
      if (cachedIcon) {
        return cachedIcon;
      }

      // Try to extract from domain root
      const faviconUrl = await this.extractFavicon(`https://${domain}`);
      return faviconUrl;
    } catch (error) {
      console.error('Error getting favicon URL:', error);
      return this.getDefaultIcon();
    }
  }

  /**
   * Upload custom icon file
   */
  async uploadCustomIcon(file: Express.Multer.File): Promise<string> {
    try {
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/x-icon'];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new Error('Invalid file type. Only PNG, JPEG, GIF, SVG, and ICO files are allowed.');
      }

      // Generate unique filename
      const timestamp = Date.now();
      const extension = path.extname(file.originalname);
      const filename = `favicon-${timestamp}${extension}`;
      const uploadPath = path.join(config.uploadDir, 'icons', filename);

      // Ensure upload directory exists
      await fs.mkdir(path.dirname(uploadPath), { recursive: true });

      // Save file
      await fs.writeFile(uploadPath, file.buffer);

      // Return relative URL
      return `/uploads/icons/${filename}`;
    } catch (error) {
      console.error('Error uploading custom icon:', error);
      throw error;
    }
  }

  /**
   * Get default icon path
   */
  getDefaultIcon(): string {
    return this.defaultIconPath;
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      const parsedUrl = new URL(this.normalizeUrl(url));
      return parsedUrl.hostname;
    } catch (error) {
      // If URL parsing fails, try to extract domain manually
      const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/);
      return match && match[1] ? match[1] : url;
    }
  }

  /**
   * Get cached favicon if available and not expired
   */
  private async getCachedFavicon(domain: string): Promise<string | null> {
    try {
      const query = `
        SELECT icon_url, expires_at
        FROM favicon_cache
        WHERE domain = ? AND expires_at > NOW()
      `;

      const [rows] = await pool.execute<FaviconCacheRow[]>(query, [domain]);
      
      if (rows.length > 0 && rows[0]) {
        return rows[0].icon_url;
      }

      return null;
    } catch (error) {
      console.error('Error getting cached favicon:', error);
      return null;
    }
  }

  /**
   * Build candidate favicon URLs from HTML and common locations
   */
  private async buildCandidateUrls(url: string): Promise<string[]> {
    const candidates: string[] = [];
    const originVariants = this.getOriginVariants(url);

    // Try HTML extraction for the provided URL and origin variants.
    for (const baseUrl of [this.normalizeUrl(url), ...originVariants]) {
      const htmlIcons = await this.extractFaviconFromHtml(baseUrl);
      for (const iconUrl of htmlIcons) {
        const resolved = this.resolveIconUrl(iconUrl, baseUrl);
        if (resolved) {
          candidates.push(resolved);
        }
      }
    }

    // Common favicon locations
    const commonPaths = [
      '/favicon.ico',
      '/favicon.png',
      '/favicon.svg',
      '/apple-touch-icon.png',
      '/apple-touch-icon-precomposed.png',
      '/android-chrome-192x192.png',
      '/android-chrome-512x512.png'
    ];

    for (const origin of originVariants) {
      for (const pathSuffix of commonPaths) {
        candidates.push(`${origin}${pathSuffix}`);
      }
    }

    return this.uniqueList(candidates);
  }

  /**
   * Extract favicon URL from HTML content
   */
  private async extractFaviconFromHtml(url: string): Promise<string[]> {
    try {
      const response = await axios.get(url, {
        timeout: config.faviconTimeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        validateStatus: (status) => status < 400,
        responseType: 'text'
      });

      if (response.status >= 400) {
        return [];
      }

      const html = response.data as string;
      const $ = cheerio.load(html);

      const icons: { href: string; score: number }[] = [];
      $('link').each((_, element) => {
        const rel = ($(element).attr('rel') || '').toLowerCase();
        if (!rel.includes('icon')) {
          return;
        }

        const href = $(element).attr('href');
        if (!href) {
          return;
        }

        const sizes = ($(element).attr('sizes') || '').toLowerCase();
        const score = this.calculateIconScore(rel, sizes);
        icons.push({ href, score });
      });

      return icons
        .sort((a, b) => b.score - a.score)
        .map(icon => icon.href);
    } catch (error) {
      console.error('Error extracting favicon from HTML:', error);
      return [];
    }
  }

  /**
   * Resolve relative icon URL to absolute URL
   */
  private resolveIconUrl(iconUrl: string, baseUrl: string): string | null {
    try {
      return new URL(iconUrl, baseUrl).toString();
    } catch (error) {
      console.error('Error resolving icon URL:', error);
      return null;
    }
  }

  /**
   * Check if a URL exists and returns a valid image response
   */
  private async checkUrlExists(url: string): Promise<boolean> {
    try {
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      };

      const headResponse = await axios.head(url, {
        timeout: config.faviconTimeout,
        headers,
        validateStatus: (status) => status < 400
      });

      const contentType = (headResponse.headers['content-type'] || '').toLowerCase();
      if (this.isImageContentType(contentType)) {
        return true;
      }

      const getResponse = await axios.get(url, {
        timeout: config.faviconTimeout,
        headers,
        validateStatus: (status) => status < 400,
        responseType: 'arraybuffer'
      });

      const getContentType = (getResponse.headers['content-type'] || '').toLowerCase();
      return this.isImageContentType(getContentType) && (getResponse.data as ArrayBuffer).byteLength > 0;
    } catch (error) {
      return false;
    }
  }

  private async findFirstValidIcon(urls: string[]): Promise<string | null> {
    for (const candidate of urls) {
      if (await this.checkUrlExists(candidate)) {
        return candidate;
      }
    }
    return null;
  }

  private normalizeUrl(url: string): string {
    if (/^https?:\/\//i.test(url)) {
      return url;
    }
    return `https://${url}`;
  }

  private getOriginVariants(url: string): string[] {
    try {
      const parsed = new URL(this.normalizeUrl(url));
      const hostname = parsed.hostname;
      const hostVariants = new Set<string>([hostname]);

      if (!hostname.startsWith('www.')) {
        hostVariants.add(`www.${hostname}`);
      } else {
        hostVariants.add(hostname.replace(/^www\./, ''));
      }

      const origins: string[] = [];
      for (const host of hostVariants) {
        origins.push(`https://${host}`);
        origins.push(`http://${host}`);
      }

      return this.uniqueList(origins);
    } catch (error) {
      return [];
    }
  }

  private uniqueList(items: string[]): string[] {
    return Array.from(new Set(items.filter(Boolean)));
  }

  private calculateIconScore(rel: string, sizes: string): number {
    let score = 0;
    if (rel.includes('apple-touch-icon')) {
      score += 30;
    } else if (rel.includes('shortcut')) {
      score += 20;
    } else if (rel.includes('icon')) {
      score += 10;
    }

    if (sizes && sizes !== 'any') {
      const sizeMatches = sizes.split(/\s+/).map(size => size.split('x').map(Number));
      const maxSize = sizeMatches.reduce((max, sizePair) => {
        const [width, height] = sizePair;
        if (
          sizePair.length !== 2 ||
          width === undefined ||
          height === undefined ||
          Number.isNaN(width) ||
          Number.isNaN(height)
        ) {
          return max;
        }
        return Math.max(max, width * height);
      }, 0);
      score += Math.min(50, Math.sqrt(maxSize));
    }

    return score;
  }

  private isImageContentType(contentType: string): boolean {
    return (
      contentType.startsWith('image/') ||
      contentType.includes('image') ||
      contentType.includes('icon') ||
      contentType.includes('svg') ||
      contentType === 'application/octet-stream'
    );
  }

  /**
   * Clean up expired favicon cache entries
   */
  async cleanupExpiredCache(): Promise<void> {
    try {
      const query = 'DELETE FROM favicon_cache WHERE expires_at < NOW()';
      await pool.execute(query);
    } catch (error) {
      console.error('Error cleaning up expired favicon cache:', error);
    }
  }
}

// Export singleton instance
export const faviconService = new FaviconServiceImpl();
