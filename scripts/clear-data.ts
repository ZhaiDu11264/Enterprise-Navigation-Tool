#!/usr/bin/env ts-node

/**
 * Database Data Clear Script
 * This script clears all data from tables but keeps the table structure
 */

import { executeQuery, testConnection, closePool } from '../src/config/database';
import { runMigrations } from '../src/utils/migrations';
import { initializeDefaultConfiguration } from './init-default-config';

async function clearDatabaseData(): Promise<void> {
  try {
    console.log('🔄 Starting database data cleanup...');
    
    // Test database connection
    await testConnection();
    console.log('✅ Database connection established');
    
    // Disable foreign key checks temporarily
    await executeQuery('SET FOREIGN_KEY_CHECKS = 0');
    console.log('🔓 Foreign key checks disabled');
    
    // Clear all data from tables
    console.log('🗑️  Clearing data from all tables...');
    
    const clearTables = [
      'DELETE FROM favicon_cache',
      'DELETE FROM user_sessions', 
      'DELETE FROM website_links',
      'DELETE FROM `groups`',
      'DELETE FROM default_configurations',
      'DELETE FROM migrations',
      'DELETE FROM users'
    ];
    
    for (const clearQuery of clearTables) {
      try {
        const result = await executeQuery(clearQuery);
        console.log(`✅ ${clearQuery} - ${(result as any).affectedRows || 0} rows deleted`);
      } catch (error) {
        console.log(`⚠️  Warning: ${clearQuery} - ${(error as Error).message}`);
      }
    }
    
    // Reset auto increment counters
    console.log('🔄 Resetting auto increment counters...');
    const resetCounters = [
      'ALTER TABLE users AUTO_INCREMENT = 1',
      'ALTER TABLE `groups` AUTO_INCREMENT = 1', 
      'ALTER TABLE website_links AUTO_INCREMENT = 1',
      'ALTER TABLE default_configurations AUTO_INCREMENT = 1',
      'ALTER TABLE favicon_cache AUTO_INCREMENT = 1'
    ];
    
    for (const resetQuery of resetCounters) {
      try {
        await executeQuery(resetQuery);
        console.log(`✅ ${resetQuery}`);
      } catch (error) {
        console.log(`⚠️  Warning: ${resetQuery} - ${(error as Error).message}`);
      }
    }
    
    // Re-enable foreign key checks
    await executeQuery('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🔒 Foreign key checks re-enabled');
    
    // Run migrations to ensure all tables and default data are created
    console.log('🔄 Running migrations to restore default data...');
    await runMigrations();
    
    // Initialize default configuration
    console.log('🔄 Initializing default configuration...');
    await initializeDefaultConfiguration();
    
    console.log('✅ Database data cleanup completed successfully!');
    console.log('\n📊 Database is now clean with:');
    console.log('   • All user data cleared');
    console.log('   • Fresh default admin user');
    console.log('   • Default enterprise configuration');
    console.log('   • Internal office system links ready');
    
  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
    throw error;
  } finally {
    await closePool();
  }
}

// Run the cleanup
if (require.main === module) {
  clearDatabaseData()
    .then(() => {
      console.log('\n🎉 Database cleanup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Database cleanup failed:', error);
      process.exit(1);
    });
}

export { clearDatabaseData };