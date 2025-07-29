import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  server: {
    proxy: {
      // 配置 API 代理
      '/api': {
        target: 'http://47.99.131.58:3000', // 替换为实际的 API 域名
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        // 如需使用 HTTPS，可添加以下配置
        // secure: false,
        // 如需处理 WebSocket
        // ws: true
      }
    }
  },
  build: {
    outDir: 'dist', // 替代 Next.js 的 out 目录
    assetsDir: 'assets'
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
