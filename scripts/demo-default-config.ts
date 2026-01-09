#!/usr/bin/env ts-node

/**
 * Demo script to showcase the default configuration functionality
 * This script demonstrates how the system protects internal office links
 */

import { ConfigurationService } from '../src/models/DefaultConfiguration';
import { GroupService } from '../src/models/Group';
import { LinkService } from '../src/models/WebsiteLink';
import { UserService } from '../src/models/User';
import { testConnection, closePool } from '../src/config/database';

async function demonstrateDefaultConfiguration(): Promise<void> {
  try {
    console.log('🎯 Default Configuration Demo');
    console.log('============================\n');
    
    // Test database connection
    await testConnection();
    console.log('✅ Database connection established\n');
    
    // 1. Show active configuration
    console.log('1️⃣  Checking active default configuration...');
    const activeConfig = await ConfigurationService.getActiveConfiguration();
    
    if (activeConfig) {
      console.log(`✅ Active configuration: ${activeConfig.name}`);
      console.log(`📝 Description: ${activeConfig.description}`);
      console.log(`📊 Groups: ${activeConfig.configData.groups.length}`);
      console.log(`🔗 Links: ${activeConfig.configData.links.length}`);
      
      // Show system groups and links
      const systemGroups = activeConfig.configData.groups.filter(g => g.isSystemGroup);
      const systemLinks = activeConfig.configData.links.filter(l => l.isSystemLink);
      
      console.log(`🔒 System groups: ${systemGroups.length}`);
      console.log(`🔒 System links: ${systemLinks.length}\n`);
      
      // List system links
      console.log('🏢 Internal Office System Links:');
      systemLinks.forEach((link, index) => {
        console.log(`   ${index + 1}. ${link.name} - ${link.url}`);
        console.log(`      ${link.description}`);
      });
      console.log();
    } else {
      console.log('❌ No active configuration found\n');
    }
    
    // 2. Create a demo user
    console.log('2️⃣  Creating demo user...');
    const demoUser = await UserService.createUser({
      username: 'demo_user_' + Date.now(),
      email: `demo${Date.now()}@example.com`,
      password: 'password123',
      role: 'user'
    });
    console.log(`✅ Demo user created: ${demoUser.username} (ID: ${demoUser.id})\n`);
    
    // 3. Apply default configuration
    console.log('3️⃣  Applying default configuration to demo user...');
    if (activeConfig) {
      await ConfigurationService.applyToUser(demoUser.id, activeConfig.id, 'reset');
      console.log('✅ Default configuration applied\n');
    }
    
    // 4. Show user's groups and links
    console.log('4️⃣  Checking user\'s groups and links...');
    const userGroups = await GroupService.getUserGroups(demoUser.id);
    const userLinks = await LinkService.getUserLinks(demoUser.id);
    
    console.log(`📁 User has ${userGroups.length} groups:`);
    userGroups.forEach((group, index) => {
      const protection = group.isSystemGroup ? '🔒 System' : '👤 User';
      const deletable = group.isDeletable ? 'Deletable' : 'Protected';
      console.log(`   ${index + 1}. ${group.name} (${protection}, ${deletable})`);
    });
    
    console.log(`\n🔗 User has ${userLinks.length} links:`);
    userLinks.forEach((link, index) => {
      const protection = link.isSystemLink ? '🔒 System' : '👤 User';
      const deletable = link.isDeletable ? 'Deletable' : 'Protected';
      console.log(`   ${index + 1}. ${link.name} - ${link.url}`);
      console.log(`      ${protection}, ${deletable}`);
    });
    console.log();
    
    // 5. Demonstrate protection - try to delete system group
    console.log('5️⃣  Testing system protection...');
    const systemGroup = userGroups.find(g => g.isSystemGroup);
    const systemLink = userLinks.find(l => l.isSystemLink);
    
    if (systemGroup) {
      console.log(`🔒 Attempting to delete system group: ${systemGroup.name}`);
      try {
        await GroupService.deleteGroup(systemGroup.id, demoUser.id);
        console.log('❌ ERROR: System group was deleted (this should not happen!)');
      } catch (error) {
        console.log(`✅ Protection working: ${(error as Error).message}`);
      }
    }
    
    if (systemLink) {
      console.log(`🔒 Attempting to delete system link: ${systemLink.name}`);
      try {
        await LinkService.deleteLink(systemLink.id, demoUser.id);
        console.log('❌ ERROR: System link was deleted (this should not happen!)');
      } catch (error) {
        console.log(`✅ Protection working: ${(error as Error).message}`);
      }
    }
    console.log();
    
    // 6. Show configuration statistics
    console.log('6️⃣  Configuration statistics...');
    if (activeConfig) {
      const stats = await ConfigurationService.getConfigurationStats(activeConfig.id);
      console.log(`📊 Groups in configuration: ${stats.groupCount}`);
      console.log(`📊 Links in configuration: ${stats.linkCount}`);
      console.log(`📊 Users with this configuration: ${stats.usersWithConfig}`);
    }
    console.log();
    
    // 7. Clean up demo user
    console.log('7️⃣  Cleaning up demo user...');
    await UserService.deleteUser(demoUser.id);
    console.log('✅ Demo user cleaned up\n');
    
    console.log('🎉 Demo completed successfully!');
    console.log('\nKey Features Demonstrated:');
    console.log('• ✅ Default configuration automatically applied to new users');
    console.log('• 🔒 System groups and links are protected from deletion');
    console.log('• 🏢 Internal office systems are always available to users');
    console.log('• 👨‍💼 Only administrators can modify default configurations');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
    throw error;
  } finally {
    await closePool();
  }
}

// Run the demo
if (require.main === module) {
  demonstrateDefaultConfiguration()
    .then(() => {
      console.log('\n✨ Demo completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Demo failed:', error);
      process.exit(1);
    });
}

export { demonstrateDefaultConfiguration };