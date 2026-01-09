#!/usr/bin/env node

/**
 * 重置速率限制的开发工具
 * 在开发过程中如果触发了速率限制，可以使用此脚本重置
 */

const http = require('http');

console.log('🔄 重置速率限制...');

// 重启开发服务器是最简单的方法来重置内存中的速率限制
console.log('💡 提示：重启开发服务器可以重置所有速率限制');
console.log('   - 按 Ctrl+C 停止服务器');
console.log('   - 运行 npm run dev 重新启动');

// 或者等待速率限制窗口过期
console.log('⏰ 或者等待 15 分钟让速率限制自动重置');

// 检查服务器状态
const checkServer = () => {
  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/health',
    method: 'GET'
  }, (res) => {
    if (res.statusCode === 200) {
      console.log('✅ 服务器运行正常');
    } else if (res.statusCode === 429) {
      console.log('❌ 服务器仍然受到速率限制');
      console.log('   请重启服务器或等待 15 分钟');
    } else {
      console.log(`⚠️  服务器返回状态码: ${res.statusCode}`);
    }
  });

  req.on('error', (err) => {
    console.log('❌ 无法连接到服务器:', err.message);
    console.log('   请确保服务器正在运行');
  });

  req.end();
};

console.log('🔍 检查服务器状态...');
checkServer();

// 提供一些有用的信息
console.log('\n📋 速率限制信息:');
console.log('   - 开发环境: 15分钟内最多 1000 次请求');
console.log('   - 生产环境: 15分钟内最多 100 次请求');
console.log('   - 认证请求: 15分钟内最多 100 次（开发）/ 5 次（生产）');

console.log('\n🛠️  如果问题持续存在:');
console.log('   1. 检查是否有其他程序在发送大量请求');
console.log('   2. 清除浏览器缓存和 localStorage');
console.log('   3. 使用无痕模式测试');
console.log('   4. 检查网络代理设置');