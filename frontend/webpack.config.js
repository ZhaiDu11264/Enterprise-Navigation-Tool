const path = require('path');

module.exports = {
  // 只在生产环境使用
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  
  // 代码分割优化
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // 将第三方库分离到单独的chunk
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        },
        // 将常用组件分离
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
          reuseExistingChunk: true
        }
      }
    }
  },
  
  // 解析优化
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@utils': path.resolve(__dirname, 'src/utils')
    }
  }
};