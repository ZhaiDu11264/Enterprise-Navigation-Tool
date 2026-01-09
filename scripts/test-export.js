const { LinkService } = require('../dist/models/WebsiteLink');

async function testExport() {
  try {
    console.log('🔍 Testing export functionality...');
    
    // Test with admin user (userId = 1)
    const userId = 1;
    console.log(`📊 Getting links for user ${userId}...`);
    
    const links = await LinkService.getLinksWithGroups(userId);
    console.log(`✅ Found ${links.length} links`);
    
    if (links.length > 0) {
      console.log('📋 Sample link:', {
        name: links[0].name,
        url: links[0].url,
        description: links[0].description,
        groupName: links[0].groupName
      });
      
      // Generate CSV content
      const csvHeader = 'name,url,description,group\n';
      const csvRows = links.map(link => {
        const name = `"${link.name.replace(/"/g, '""')}"`;
        const url = `"${link.url.replace(/"/g, '""')}"`;
        const description = `"${(link.description || '').replace(/"/g, '""')}"`;
        const group = `"${(link.groupName || '默认分组').replace(/"/g, '""')}"`;
        return `${name},${url},${description},${group}`;
      }).join('\n');
      
      const csvContent = csvHeader + csvRows;
      console.log('📄 Generated CSV content:');
      console.log(csvContent.substring(0, 200) + '...');
    } else {
      console.log('⚠️  No links found for user');
    }
    
  } catch (error) {
    console.error('❌ Export test failed:', error);
  }
}

testExport();