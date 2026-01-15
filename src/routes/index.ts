import { Router } from 'express';
import authRoutes from './auth';
import adminRoutes from './admin';
import userRoutes from './users';
import linkRoutes from './links';
import groupRoutes from './groups';
import faviconRoutes from './favicon';
import reorderRoutes from './reorder';
import searchRoutes from './search';
import importRoutes from './import';
import exportRoutes from './export';
import configRoutes from './config';
import batchRoutes from './batch';
import simpleImportExportRoutes from './simpleImportExport';
import notificationRoutes from './notifications';

const router = Router();

// Authentication routes
router.use('/auth', authRoutes);

// User routes
router.use('/users', userRoutes);

// Admin routes
router.use('/admin', adminRoutes);

// Notification routes
router.use('/notifications', notificationRoutes);

// Configuration routes
router.use('/config', configRoutes);

// Link management routes
router.use('/links', linkRoutes);

// Group management routes
router.use('/groups', groupRoutes);

// Favicon service routes
router.use('/favicon', faviconRoutes);

// Reordering routes
router.use('/reorder', reorderRoutes);

// Search routes
router.use('/search', searchRoutes);

// Import/Export routes
router.use('/import', importRoutes);
router.use('/export', exportRoutes);

// Batch operations routes
router.use('/batch', batchRoutes);

// Simple import/export routes (lightweight alternative)
router.use('/', simpleImportExportRoutes);

// Health check for API
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Enterprise Navigation Tool API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default router;
