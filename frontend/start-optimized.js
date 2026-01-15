#!/usr/bin/env node

// 优化的启动脚本
process.env.GENERATE_SOURCEMAP = 'false';
process.env.INLINE_RUNTIME_CHUNK = 'false';
process.env.FAST_REFRESH = 'true';

// 增加Node.js内存限制
process.env.NODE_OPTIONS = '--max-old-space-size=4096';

// 启动开发服务器
require('react-scripts/scripts/start');
