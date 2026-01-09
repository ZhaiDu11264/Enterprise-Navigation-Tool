const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000/api';

async function testImportFix() {
  console.log('🧪 测试导入BOM修复...\n');

  try {
    // 1. 登录获取token
    console.log('1️⃣ 登录获取token...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ 登录成功');

    // 2. 创建测试CSV文件（带BOM）
    console.log('\n2️⃣ 创建测试CSV文件...');
    const csvContent = '\ufeffname,url,description,group\n' + // 添加BOM字符
      '测试网站1,https://test1.com,测试描述1,测试分组\n' +
      '测试网站2,https://test2.com,测试描述2,测试分组\n' +
      '无URL网站,,测试描述3,测试分组\n'; // 这行应该失败

    const testFile = 'test-import-bom.csv';
    fs.writeFileSync(testFile, csvContent);
    console.log('✅ 测试文件已创建:', testFile);

    // 3. 测试导入
    console.log('\n3️⃣ 测试导入功能...');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFile));

    const importResponse = await axios.post(`${BASE_URL}/import/simple`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ 导入完成!');
    console.log('📊 导入结果:', importResponse.data);
    console.log('📈 成功导入:', importResponse.data.imported);
    console.log('❌ 错误数量:', importResponse.data.errors?.length || 0);
    
    if (importResponse.data.errors && importResponse.data.errors.length > 0) {
      console.log('📝 错误详情:');
      importResponse.data.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    // 4. 清理测试文件
    fs.unlinkSync(testFile);
    console.log('\n🧹 测试文件已清理');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('📄 响应数据:', error.response.data);
    }
  }
}

testImportFix();