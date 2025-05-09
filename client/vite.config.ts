import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import stdLibBrowser from 'vite-plugin-node-stdlib-browser'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    stdLibBrowser()
  ],
  define: {
    'process.env': {},
  },
  resolve: {
    alias: {
      globalThis: 'globalThis'
    }
  },

  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
        format: 'es'
      }
    }
  },
  optimizeDeps: {
    include: ['mime-types']
  }
})
