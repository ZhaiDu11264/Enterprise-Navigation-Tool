const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000/api';

async function testCaseInsensitiveImport() {
  console.log('🧪 测试不区分大小写的导入功能...\n');

  try {
    // 1. 登录
    console.log('1️⃣ 登录...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ 登录成功');

    // 2. 测试不同的字段名格式
    const testCases = [
      {
        name: '小写字段名',
        content: 'name,url,description,group\n测试1,https://test1.com,描述1,分组1\n'
      },
      {
        name: '大写字段名',
        content: 'Name,URL,Description,Group\n测试2,https://test2.com,描述2,分组2\n'
      },
      {
        name: '混合字段名',
        content: 'Title,Link,Desc,Category\n测试3,https://test3.com,描述3,分组3\n'
      },
      {
        name: '示例文件格式',
        content: 'Name,URL,Description,Group,Icon URL\n测试4,https://test4.com,描述4,分组4,https://test4.com/icon.ico\n'
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n📋 测试: ${testCase.name}`);
      
      const testFile = `test-${testCase.name.replace(/\s+/g, '-')}.csv`;
      fs.writeFileSync(testFile, testCase.content);

      const formData = new FormData();
      formData.append('file', fs.createReadStream(testFile));

      try {
        const importResponse = await axios.post(`${BASE_URL}/import/simple`, formData, {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${token}`
          }
        });

        console.log(`✅ ${testCase.name} - 成功导入: ${importResponse.data.imported}`);
        if (importResponse.data.errors && importResponse.data.errors.length > 0) {
          console.log(`❌ 错误: ${importResponse.data.errors.join(', ')}`);
        }
      } catch (error) {
        console.log(`❌ ${testCase.name} - 失败: ${error.response?.data || error.message}`);
      }

      // 清理文件
      fs.unlinkSync(testFile);
    }

    // 3. 测试实际的示例文件
    console.log('\n📁 测试实际示例文件...');
    if (fs.existsSync('sample-import.csv')) {
      const formData = new FormData();
      formData.append('file', fs.createReadStream('sample-import.csv'));

      try {
        const importResponse = await axios.post(`${BASE_URL}/import/simple`, formData, {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('✅ 示例文件导入完成!');
        console.log('📊 成功导入:', importResponse.data.imported);
        console.log('❌ 错误数量:', importResponse.data.errors?.length || 0);
        
        if (importResponse.data.errors && importResponse.data.errors.length > 0) {
          console.log('📝 错误详情:');
          importResponse.data.errors.slice(0, 3).forEach((error, index) => {
            console.log(`   ${index + 1}. ${error}`);
          });
          if (importResponse.data.errors.length > 3) {
            console.log(`   ... 还有 ${importResponse.data.errors.length - 3} 个错误`);
          }
        }
      } catch (error) {
        console.log('❌ 示例文件导入失败:', error.response?.data || error.message);
      }
    } else {
      console.log('⚠️ 示例文件不存在');
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('📄 响应数据:', error.response.data);
    }
  }
}

testCaseInsensitiveImport();