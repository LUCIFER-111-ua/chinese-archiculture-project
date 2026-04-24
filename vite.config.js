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
