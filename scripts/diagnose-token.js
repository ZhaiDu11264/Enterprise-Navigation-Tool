const axios = require('axios');
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:3000/api';

async function diagnoseToken() {
  console.log('🔍 开始诊断token问题...\n');

  try {
    // 1. 获取新的token
    console.log('1️⃣ 获取新token...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });

    const tokenData = loginResponse.data.data;
    const token = tokenData.token;
    
    console.log('✅ 登录成功');
    console.log('📄 完整响应:', JSON.stringify(loginResponse.data, null, 2));
    console.log('🔑 Token:', token.substring(0, 100) + '...');

    // 2. 解码token查看内容
    console.log('\n2️⃣ 解码token...');
    try {
      const decoded = jwt.decode(token, { complete: true });
      console.log('📋 Token头部:', JSON.stringify(decoded.header, null, 2));
      console.log('📋 Token载荷:', JSON.stringify(decoded.payload, null, 2));
      
      const now = Math.floor(Date.now() / 1000);
      const exp = decoded.payload.exp;
      console.log('⏰ 当前时间:', now);
      console.log('⏰ 过期时间:', exp);
      console.log('⏰ 剩余时间:', exp - now, '秒');
      
      if (exp < now) {
        console.log('❌ Token已过期!');
      } else {
        console.log('✅ Token未过期');
      }
    } catch (decodeError) {
      console.error('❌ Token解码失败:', decodeError.message);
    }

    // 3. 测试token验证
    console.log('\n3️⃣ 测试token验证...');
    try {
      const exportResponse = await axios.get(`${BASE_URL}/export/simple`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Token验证成功!');
      console.log('📊 导出响应状态:', exportResponse.status);
      console.log('📄 Content-Type:', exportResponse.headers['content-type']);
      console.log('📏 内容长度:', exportResponse.data.length);
      
    } catch (exportError) {
      console.error('❌ Token验证失败:', exportError.response?.data || exportError.message);
    }

    // 4. 测试不同的token格式
    console.log('\n4️⃣ 测试token格式...');
    
    // 测试直接token（无Bearer前缀）
    try {
      const directResponse = await axios.get(`${BASE_URL}/export/simple`, {
        headers: {
          'Authorization': token
        }
      });
      console.log('✅ 直接token格式成功');
    } catch (directError) {
      console.log('❌ 直接token格式失败:', directError.response?.data?.error?.message || directError.message);
    }

    // 测试空格问题
    try {
      const spaceResponse = await axios.get(`${BASE_URL}/export/simple`, {
        headers: {
          'Authorization': `Bearer  ${token}` // 双空格
        }
      });
      console.log('✅ 双空格格式成功');
    } catch (spaceError) {
      console.log('❌ 双空格格式失败:', spaceError.response?.data?.error?.message || spaceError.message);
    }

    // 5. 模拟前端localStorage存储
    console.log('\n5️⃣ 模拟前端存储...');
    console.log('localStorage应该存储的token:', token);
    console.log('前端应该发送的Authorization头:', `Bearer ${token}`);

  } catch (error) {
    console.error('❌ 诊断失败:', error.message);
    if (error.response) {
      console.error('📄 响应数据:', error.response.data);
    }
  }
}

diagnoseToken();