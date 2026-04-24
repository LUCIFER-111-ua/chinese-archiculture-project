import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: './',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three']
        }
      }
    },
    chunkSizeWarningLimit: 800
  },
  optimizeDeps: {
    include: ['three', 'three/addons/loaders/GLTFLoader.js']
  }
})
