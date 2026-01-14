import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/stream': 'http://localhost:8000',
      '/incidents': 'http://localhost:8000',
      '/api': 'http://localhost:8000',
      '/dashboard/flights': 'http://localhost:8000',
      '/dashboard/gates': 'http://localhost:8000',
      '/dashboard/crew': 'http://localhost:8000',
      '/dashboard/weather': 'http://localhost:8000',
      '/dashboard/timeline': 'http://localhost:8000',
      '/dashboard/notifications': 'http://localhost:8000',
    }
  },
  preview: {
    preview: {
      // Proxy removed to ensure SPA routing works
    }
  }
})
