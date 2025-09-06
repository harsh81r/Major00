import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [

    react()
  ],
  server: {
    host: true
  },
  define: {
    "process.env.VITE_APP_BACKEND_URL": JSON.stringify("http://localhost:5001")
  },
  optimizeDeps: {
    include: ['socket.io-client']
  }
})
