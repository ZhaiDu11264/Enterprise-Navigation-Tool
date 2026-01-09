const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testManualSync() {
  try {
    console.log('🧪 Testing Manual Sync Functionality');
    console.log('=====================================');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });

    if (!loginResponse.data.success) {
      throw new Error('Admin login failed');
    }

    const adminToken = loginResponse.data.data.token;
    console.log('✅ Admin login successful');

    // Step 2: Test config status endpoint
    console.log('2. Testing config status endpoint...');
    const statusResponse = await axios.get(`${BASE_URL}/config/status`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('✅ Config status:', statusResponse.data.data.status);

    // Step 3: Test config refresh endpoint
    console.log('3. Testing config refresh endpoint...');
    const refreshResponse = await axios.post(`${BASE_URL}/config/refresh`, {}, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('✅ Config refresh:', refreshResponse.data);

    // Step 4: Test multiple rapid requests (should not hit rate limit)
    console.log('4. Testing rapid requests (rate limit check)...');
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(
        axios.get(`${BASE_URL}/config/status`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        })
      );
    }

    const rapidResults = await Promise.all(promises);
    console.log(`✅ All ${rapidResults.length} rapid requests succeeded`);

    console.log('\n🎉 All tests passed! Manual sync functionality is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 429) {
      console.error('⚠️  Rate limiting is still active!');
    }
    
    process.exit(1);
  }
}

// Run the test
testManualSync();