const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:3001/api'; // 前端代理地址

async function testFrontendImport() {
  console.log('🧪 测试前端导入功能...\n');

  try {
    // 1. 通过前端代理登录
    console.log('1️⃣ 通过前端代理登录...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ 登录成功');

    // 2. 创建测试CSV文件
    console.log('\n2️⃣ 创建测试CSV文件...');
    const csvContent = '\ufeffname,url,description,group\n' +
      '前端测试1,https://frontend1.com,前端测试描述1,前端测试分组\n' +
      '前端测试2,https://frontend2.com,前端测试描述2,前端测试分组\n';

    const testFile = 'test-frontend-import.csv';
    fs.writeFileSync(testFile, csvContent);
    console.log('✅ 测试文件已创建');

    // 3. 通过前端代理测试导入
    console.log('\n3️⃣ 通过前端代理测试导入...');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFile));

    const importResponse = await axios.post(`${BASE_URL}/import/simple`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ 前端代理导入完成!');
    console.log('📊 导入结果:', importResponse.data);

    // 4. 清理
    fs.unlinkSync(testFile);
    console.log('\n🧹 测试文件已清理');

  } catch (error) {
    console.error('❌ 前端导入测试失败:', error.message);
    if (error.response) {
      console.error('📄 响应状态:', error.response.status);
      console.error('📄 响应数据:', error.response.data);
    }
  }
}

testFrontendImport();