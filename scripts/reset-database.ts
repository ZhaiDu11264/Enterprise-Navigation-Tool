#!/usr/bin/env ts-node

/**
 * Database Reset Script
 * This script drops all tables and recreates the database from scratch
 */

import { executeQuery, testConnection, closePool } from '../src/config/database';
import { runMigrations } from '../src/utils/migrations';
import { initializeDefaultConfiguration } from './init-default-config';

async function resetDatabase(): Promise<void> {
  try {
    console.log('🔄 Starting database reset...');
    
    // Test database connection
    await testConnection();
    console.log('✅ Database connection established');
    
    // Drop all tables in reverse order (to handle foreign key constraints)
    console.log('🗑️  Dropping existing tables...');
    
    const dropTables = [
      'DROP TABLE IF EXISTS favicon_cache',
      'DROP TABLE IF EXISTS user_sessions',
      'DROP TABLE IF EXISTS website_links',
      'DROP TABLE IF EXISTS `groups`',
      'DROP TABLE IF EXISTS default_configurations',
      'DROP TABLE IF EXISTS migrations',
      'DROP TABLE IF EXISTS users'
    ];
    
    for (const dropQuery of dropTables) {
      try {
        await executeQuery(dropQuery);
        console.log(`✅ Executed: ${dropQuery}`);
      } catch (error) {
        console.log(`⚠️  Warning: ${dropQuery} - ${(error as Error).message}`);
      }
    }
    
    console.log('✅ All tables dropped successfully');
    
    // Run migrations to recreate tables
    console.log('🔄 Running migrations to recreate database structure...');
    await runMigrations();
    
    // Initialize default configuration
    console.log('🔄 Initializing default configuration...');
    await initializeDefaultConfiguration();
    
    console.log('✅ Database reset completed successfully!');
    console.log('\n📊 Database is now clean and ready to use with:');
    console.log('   • Fresh table structure');
    console.log('   • Default admin user (admin/admin123)');
    console.log('   • Default enterprise configuration');
    console.log('   • Internal office system links');
    
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    throw error;
  } finally {
    try {
      await closePool();
    } catch (closeError) {
      // Ignore connection close errors
      console.log('ℹ️  Database connection closed');
    }
  }
}

// Run the reset
if (require.main === module) {
  resetDatabase()
    .then(() => {
      console.log('\n🎉 Database reset completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Database reset failed:', error);
      process.exit(1);
    });
}

export { resetDatabase };