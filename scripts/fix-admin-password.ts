#!/usr/bin/env ts-node

/**
 * Fix Admin Password Script
 * This script creates a proper password hash for the admin user
 */

import { executeQuery, testConnection, closePool } from '../src/config/database';
import bcrypt from 'bcrypt';

async function fixAdminPassword(): Promise<void> {
  try {
    console.log('🔧 Fixing admin password...');
    
    // Test database connection
    await testConnection();
    console.log('✅ Database connection established');
    
    // Generate proper password hash for 'admin123'
    const password = 'admin123';
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    console.log(`🔐 Generated password hash for '${password}': ${passwordHash}`);
    
    // Update admin user password
    const updateQuery = 'UPDATE users SET password_hash = ? WHERE username = "admin" OR role = "admin"';
    const result = await executeQuery(updateQuery, [passwordHash]);
    
    console.log(`✅ Updated ${(result as any).affectedRows} admin user(s)`);
    
    // Verify the update
    console.log('\n🔍 Verifying password update...');
    const verifyQuery = 'SELECT username, password_hash FROM users WHERE role = "admin"';
    const users = await executeQuery<any>(verifyQuery);
    
    for (const user of users) {
      console.log(`\n👤 Username: ${user.username}`);
      const isValid = await bcrypt.compare(password, user.password_hash);
      console.log(`🔐 Password '${password}' verification: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    }
    
    console.log('\n✅ Admin password fixed successfully!');
    console.log('📋 Login credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Failed to fix admin password:', error);
    throw error;
  } finally {
    await closePool();
  }
}

// Run the fix
if (require.main === module) {
  fixAdminPassword()
    .then(() => {
      console.log('\n🎉 Admin password fix completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Admin password fix failed:', error);
      process.exit(1);
    });
}

export { fixAdminPassword };