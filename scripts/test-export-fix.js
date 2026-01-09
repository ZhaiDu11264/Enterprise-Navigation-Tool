const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testExportFix() {
  console.log('🧪 开始测试导出功能...\n');

  try {
    // 1. 测试后端连接
    console.log('1️⃣ 测试后端连接...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ 后端连接成功:', healthResponse.data);

    // 2. 测试用户登录
    console.log('\n2️⃣ 测试用户登录...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        username: 'admin',
        password: 'admin123'
      });

      console.log('📄 登录响应:', loginResponse.data);

      const token = loginResponse.data.data?.token || loginResponse.data.token;
      if (!token) {
        throw new Error('登录失败，未获取到token');
      }
      console.log('✅ 登录成功，token:', token.substring(0, 50) + '...');

      // 3. 测试导出功能
      console.log('\n3️⃣ 测试导出功能...');
      const exportResponse = await axios.get(`${BASE_URL}/export/simple`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ 导出成功!');
      console.log('📊 响应状态:', exportResponse.status);
      console.log('📄 Content-Type:', exportResponse.headers['content-type']);
      console.log('📏 内容长度:', exportResponse.data.length);
      console.log('📝 内容预览:');
      console.log(exportResponse.data.substring(0, 300) + '...');

      // 4. 保存到文件
      const fs = require('fs');
      const filename = `test-export-${new Date().toISOString().split('T')[0]}.csv`;
      fs.writeFileSync(filename, exportResponse.data);
      console.log(`💾 导出文件已保存: ${filename}`);

    } catch (loginError) {
      console.error('❌ 登录失败:', loginError.message);
      if (loginError.response) {
        console.error('📄 登录响应状态:', loginError.response.status);
        console.error('📄 登录响应数据:', loginError.response.data);
      }
      return;
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    
    if (error.response) {
      console.error('📄 响应状态:', error.response.status);
      console.error('📄 响应数据:', error.response.data);
    }
  }
}

testExportFix();