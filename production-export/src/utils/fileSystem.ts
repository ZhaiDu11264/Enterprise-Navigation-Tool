import { promises as fs } from 'fs';
import path from 'path';
import config from '../config/environment';

// Create upload directory if it doesn't exist
export const createUploadDirectory = async (): Promise<void> => {
  try {
    const uploadPath = path.resolve(config.uploadDir);
    await fs.access(uploadPath);
  } catch (error) {
    // Directory doesn't exist, create it
    const uploadPath = path.resolve(config.uploadDir);
    await fs.mkdir(uploadPath, { recursive: true });
    console.log(`📁 Created upload directory: ${uploadPath}`);
  }
};

// Ensure directory exists
export const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

// Get file extension
export const getFileExtension = (filename: string): string => {
  return path.extname(filename).toLowerCase();
};

// Generate unique filename
export const generateUniqueFilename = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = getFileExtension(originalName);
  const baseName = path.basename(originalName, extension);
  
  return `${baseName}_${timestamp}_${random}${extension}`;
};

// Validate file type
export const isValidImageFile = (filename: string): boolean => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico'];
  const extension = getFileExtension(filename);
  return allowedExtensions.includes(extension);
};

// Get file size
export const getFileSize = async (filePath: string): Promise<number> => {
  const stats = await fs.stat(filePath);
  return stats.size;
};