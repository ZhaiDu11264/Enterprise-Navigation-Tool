const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testUserSync() {
  try {
    console.log('🧪 Testing User Manual Sync');
    console.log('============================');

    // Step 1: Login as regular user
    console.log('1. Logging in as regular user...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'testuser',
      password: 'test123'
    });

    if (!loginResponse.data.success) {
      throw new Error('User login failed');
    }

    const userToken = loginResponse.data.data.token;
    console.log('✅ User login successful');

    // Step 2: Check config status (same as ManualSyncButton)
    console.log('2. Checking config status...');
    const statusResponse = await axios.get(`${BASE_URL}/config/status`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    console.log('✅ Config status response:', statusResponse.data);

    // Step 3: Call config refresh (same as ManualSyncButton)
    console.log('3. Calling config refresh...');
    const refreshResponse = await axios.post(`${BASE_URL}/config/refresh`, {}, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    console.log('✅ Config refresh response:', refreshResponse.data);

    // Step 4: Check user's links after sync
    console.log('4. Checking user links after sync...');
    const linksResponse = await axios.get(`${BASE_URL}/links`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    console.log('✅ User links after sync:', linksResponse.data.data.links.length, 'links found');

    console.log('\n🎉 User sync test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.error('⚠️  This would show "暂无可用的配置更新" message');
    }
    
    process.exit(1);
  }
}

// Run the test
testUserSync();