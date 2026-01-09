const axios = require('axios');
const mysql = require('mysql2/promise');

const BASE_URL = 'http://localhost:3000/api';

async function diagnoseSyncIssue() {
  console.log('🔍 Diagnosing Manual Sync Issue');
  console.log('================================');

  try {
    // 1. Check database for active configuration
    console.log('\n1. Checking database for active configuration...');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '123456',
      database: 'enterprise_navigation'
    });

    const [configs] = await connection.execute(
      'SELECT id, name, version, is_active FROM default_configurations WHERE is_active = 1'
    );

    if (configs.length === 0) {
      console.log('❌ NO ACTIVE CONFIGURATION FOUND!');
      console.log('   This is why you see "暂无可用的配置更新"');
      console.log('   Solution: Admin needs to create and activate a configuration');
      return;
    } else {
      console.log('✅ Active configuration found:', configs[0]);
    }

    await connection.end();

    // 2. Test user authentication
    console.log('\n2. Testing user authentication...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'testuser',
      password: 'test123'
    });

    if (!loginResponse.data.success) {
      console.log('❌ User authentication failed');
      return;
    }

    const userToken = loginResponse.data.data.token;
    console.log('✅ User authentication successful');

    // 3. Test config status endpoint
    console.log('\n3. Testing config status endpoint...');
    try {
      const statusResponse = await axios.get(`${BASE_URL}/config/status`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      console.log('✅ Config status endpoint working:', statusResponse.data.data.status);
    } catch (error) {
      console.log('❌ Config status endpoint failed:', error.response?.data || error.message);
      return;
    }

    // 4. Test config refresh endpoint
    console.log('\n4. Testing config refresh endpoint...');
    try {
      const refreshResponse = await axios.post(`${BASE_URL}/config/refresh`, {}, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      console.log('✅ Config refresh endpoint working:', refreshResponse.data);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('❌ Config refresh returned 404 - NO ACTIVE CONFIG');
        console.log('   This is the exact cause of "暂无可用的配置更新"');
      } else {
        console.log('❌ Config refresh endpoint failed:', error.response?.data || error.message);
      }
      return;
    }

    // 5. Check CORS headers
    console.log('\n5. Checking CORS configuration...');
    try {
      const corsResponse = await axios.options(`${BASE_URL}/config/status`);
      console.log('✅ CORS preflight successful');
    } catch (error) {
      console.log('⚠️  CORS preflight failed (might cause frontend issues):', error.message);
    }

    console.log('\n🎉 All backend tests passed!');
    console.log('   If you still see "暂无可用的配置更新" in the frontend:');
    console.log('   1. Check browser console for errors');
    console.log('   2. Verify frontend is calling the correct API URL');
    console.log('   3. Check if user is properly authenticated in frontend');
    console.log('   4. Open the test file: test-manual-sync.html in browser');

  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
  }
}

diagnoseSyncIssue();