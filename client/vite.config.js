import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/ 
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://212.132.120.102:14882',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
