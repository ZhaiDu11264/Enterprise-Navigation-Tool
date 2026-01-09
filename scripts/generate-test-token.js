const jwt = require('jsonwebtoken');

// 使用fallback密钥（因为环境变量可能没有正确加载）
const JWT_SECRET = 'fallback-secret-key';

// 生成测试token (admin用户)
const payload = {
  userId: 1,
  username: 'admin',
  email: 'admin@example.com',
  role: 'admin'
};

const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

console.log('🔑 Generated test JWT token:');
console.log(token);
console.log('\n📋 Copy this token to test the export functionality');
console.log('\n🔍 Token payload:', payload);