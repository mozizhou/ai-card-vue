import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    AutoImport({
      resolvers: [AntDesignVueResolver()]
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 80,
    proxy: {
      // 配置 API 代理
      '/api': {
        target: 'http://47.99.131.58:3000', // 替换为实际的 API 域名
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, 'api'),
        // 如需使用 HTTPS，可添加以下配置
        // secure: false,
        // 如需处理 WebSocket
        // ws: true
      }
    }
  },
  build: {
    outDir: 'dist', // 替代 Next.js 的 out 目录
    assetsDir: 'assets',
    minify: 'terser', // 使用 terser 进行代码压缩
    terserOptions: {
      compress: {
        drop_console: true, // 移除 console 语句
        drop_debugger: true // 移除 debugger 语句
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
