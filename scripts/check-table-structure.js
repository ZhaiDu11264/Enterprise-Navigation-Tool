const mysql = require('mysql2/promise');

async function checkTableStructure() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'enterprise_navigation'
  });
  
  try {
    const [columns] = await connection.execute('DESCRIBE website_links');
    console.log('website_links 表结构:');
    columns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type}`);
    });
    
    // 检查一个具体的系统链接记录
    const [systemLinks] = await connection.execute(
      'SELECT id, name, url, is_system_link FROM website_links WHERE name = "CRM系统" AND user_id = 2 LIMIT 1'
    );
    
    console.log('\n用户2的CRM系统链接:');
    console.log(systemLinks[0]);
    
  } finally {
    await connection.end();
  }
}

checkTableStructure().catch(console.error);