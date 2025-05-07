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
      globalThis: 'globalThis',  // ensures it stays as native global, not a path
      'node:fs': 'node-stdlib-browser/mock/empty',
      'node:fs/promises': 'node-stdlib-browser/mock/empty',
      'node:path': 'node-stdlib-browser/mock/empty'
    }
  },
  //add this back for the arlink deployment
  // build: {
  //   sourcemap: false,
  //   rollupOptions: {
  //     external: ['mime-types']
  //   }
  // },
  optimizeDeps: {
    exclude: ['pyodide']
  }
})
