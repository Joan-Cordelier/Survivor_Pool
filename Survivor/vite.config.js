import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy API calls during development to the backend running on localhost:4000
    proxy: {
      // Forward any request starting with /startup to the backend
      '/startup': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/user': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/event': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/fouder': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/investor': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/news': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/partner': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
