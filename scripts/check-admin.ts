#!/usr/bin/env ts-node

/**
 * Check Admin User Script
 * This script checks the admin user in the database and shows password hash
 */

import { executeQuery, testConnection, closePool } from '../src/config/database';
import bcrypt from 'bcrypt';

async function checkAdminUser(): Promise<void> {
  try {
    console.log('🔍 Checking admin user...');
    
    // Test database connection
    await testConnection();
    console.log('✅ Database connection established');
    
    // Get admin user
    const query = 'SELECT * FROM users WHERE role = "admin" OR username = "admin"';
    const results = await executeQuery<any>(query);
    
    console.log(`📊 Found ${results.length} admin user(s):`);
    
    for (const user of results) {
      console.log(`\n👤 User ID: ${user.id}`);
      console.log(`📧 Username: ${user.username}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`🔑 Role: ${user.role}`);
      console.log(`🔒 Password Hash: ${user.password_hash}`);
      console.log(`✅ Active: ${user.is_active}`);
      console.log(`📅 Created: ${user.created_at}`);
      
      // Test password verification
      console.log('\n🔐 Testing password verification:');
      try {
        const isValid1 = await bcrypt.compare('admin123', user.password_hash);
        console.log(`   'admin123': ${isValid1 ? '✅ Valid' : '❌ Invalid'}`);
        
        const isValid2 = await bcrypt.compare('admin', user.password_hash);
        console.log(`   'admin': ${isValid2 ? '✅ Valid' : '❌ Invalid'}`);
        
        const isValid3 = await bcrypt.compare('password', user.password_hash);
        console.log(`   'password': ${isValid3 ? '✅ Valid' : '❌ Invalid'}`);
      } catch (error) {
        console.log(`   ❌ Error verifying password: ${error}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to check admin user:', error);
    throw error;
  } finally {
    await closePool();
  }
}

// Run the check
if (require.main === module) {
  checkAdminUser()
    .then(() => {
      console.log('\n✅ Admin user check completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Admin user check failed:', error);
      process.exit(1);
    });
}

export { checkAdminUser };