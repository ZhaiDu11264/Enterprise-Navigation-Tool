const mysql = require('mysql2/promise');

async function cleanupAllDuplicates() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'enterprise_navigation'
  });
  
  try {
    console.log('🧹 清理所有重复链接...');
    
    // 查找每个用户的重复链接（相同名称和URL）
    const [duplicates] = await connection.execute(`
      SELECT user_id, name, url, COUNT(*) as count, GROUP_CONCAT(id) as ids
      FROM website_links 
      WHERE is_active = 1 
      GROUP BY user_id, name, url 
      HAVING COUNT(*) > 1
    `);
    
    console.log(`找到 ${duplicates.length} 组重复链接`);
    
    for (const duplicate of duplicates) {
      const ids = duplicate.ids.split(',').map(id => parseInt(id));
      console.log(`\n用户 ${duplicate.user_id} 的 "${duplicate.name}" (${duplicate.url}) 有 ${duplicate.count} 个重复`);
      console.log(`链接IDs: ${ids.join(', ')}`);
      
      // 保留第一个，删除其他的
      const keepId = ids[0];
      const deleteIds = ids.slice(1);
      
      console.log(`保留 ID: ${keepId}, 删除 IDs: ${deleteIds.join(', ')}`);
      
      for (const deleteId of deleteIds) {
        await connection.execute(
          'UPDATE website_links SET is_active = 0 WHERE id = ?',
          [deleteId]
        );
      }
    }
    
    console.log('\n✅ 重复链接清理完成！');
    
    // 验证结果
    console.log('\n=== 清理后的CRM链接 ===');
    const [crmLinks] = await connection.execute(
      'SELECT user_id, name, url FROM website_links WHERE name LIKE "%CRM%" AND is_active = 1 ORDER BY user_id'
    );
    
    crmLinks.forEach(link => {
      console.log(`用户 ${link.user_id}: ${link.name} -> ${link.url}`);
    });
    
  } finally {
    await connection.end();
  }
}

cleanupAllDuplicates().catch(console.error);