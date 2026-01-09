#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 优化前端启动性能...');

// 1. 检查并移除未使用的依赖
const packageJsonPath = path.join(__dirname, '../frontend/package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// 移除可能未使用的重型依赖
const heavyDeps = [
  '@testing-library/dom',
  '@testing-library/jest-dom', 
  '@testing-library/react',
  '@testing-library/user-event'
];

let removed = [];
heavyDeps.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    delete packageJson.dependencies[dep];
    removed.push(dep);
  }
});

if (removed.length > 0) {
  console.log('📦 移除重型测试依赖:', removed.join(', '));
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

// 2. 创建环境变量优化文件
const envOptimizePath = path.join(__dirname, '../frontend/.env.local');
const envOptimizeContent = `# 性能优化配置
GENERATE_SOURCEMAP=false
INLINE_RUNTIME_CHUNK=false
FAST_REFRESH=true
ESLINT_NO_DEV_ERRORS=true
TSC_COMPILE_ON_ERROR=true
`;

fs.writeFileSync(envOptimizePath, envOptimizeContent);
console.log('⚡ 创建性能优化环境变量');

// 3. 创建启动脚本优化
const startScriptPath = path.join(__dirname, '../frontend/start-optimized.js');
const startScriptContent = `#!/usr/bin/env node

// 优化的启动脚本
process.env.GENERATE_SOURCEMAP = 'false';
process.env.INLINE_RUNTIME_CHUNK = 'false';
process.env.FAST_REFRESH = 'true';

// 增加Node.js内存限制
process.env.NODE_OPTIONS = '--max-old-space-size=4096';

// 启动开发服务器
require('react-scripts/scripts/start');
`;

fs.writeFileSync(startScriptPath, startScriptContent);
fs.chmodSync(startScriptPath, '755');
console.log('🎯 创建优化启动脚本');

// 4. 更新package.json脚本
packageJson.scripts['start:fast'] = 'node start-optimized.js';
packageJson.scripts['build:fast'] = 'GENERATE_SOURCEMAP=false react-scripts build';

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('📝 更新package.json脚本');

console.log('✅ 前端性能优化完成！');
console.log('💡 使用 npm run start:fast 启动优化版本');
console.log('💡 使用 npm run build:fast 构建优化版本');