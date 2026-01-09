#!/usr/bin/env ts-node

/**
 * Initialize default configuration for the enterprise navigation system
 * This script ensures the internal office group and links exist for all users
 */

import { testConnection, closePool } from '../src/config/database';
import { ensureActiveDefaultConfiguration, syncConfigurationToAllUsers } from '../src/utils/defaultConfiguration';

async function initializeDefaultConfiguration(): Promise<void> {
  try {
    console.log('Initializing default configuration...');

    // Test database connection
    await testConnection();
    console.log('Database connection established');

    const activeConfig = await ensureActiveDefaultConfiguration();
    if (activeConfig) {
      await syncConfigurationToAllUsers(activeConfig.id, 'merge');
      console.log('Default configuration ensured and synced');
    } else {
      console.warn('No active configuration was created');
    }
  } catch (error) {
    console.error('Failed to initialize default configuration:', error);
    throw error;
  } finally {
    await closePool();
  }
}

// Run the initialization
if (require.main === module) {
  initializeDefaultConfiguration()
    .then(() => {
      console.log('Initialization completed successfully');
      process.exit(0);
    })
    .catch(() => {
      console.error('Initialization failed');
      process.exit(1);
    });
}

export { initializeDefaultConfiguration };
