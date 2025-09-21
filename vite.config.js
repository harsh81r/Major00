// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     host: true
//   },
//   define: {
//     "process.env.VITE_APP_BACKEND_URL": JSON.stringify("http://localhost:5001")
//   },
//   optimizeDeps: {
//     include: ['socket.io-client']
//   }
// })
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true
  },
  define: {
    "process.env.VITE_APP_BACKEND_URL": JSON.stringify(
      process.env.NODE_ENV === 'production' 
        ? process.env.VITE_APP_BACKEND_URL || "https://your-heroku-app.herokuapp.com"
        : "http://localhost:5001"
    )
  },
  optimizeDeps: {
    include: ['socket.io-client']
  },
  build: {
    // Increase the chunk size warning limit if you want to suppress the warning
    chunkSizeWarningLimit: 1000, // Increase the limit to 1MB (default is 500KB)

    rollupOptions: {
      output: {
        // This is for manual chunk splitting
        manualChunks: {
          // Example: Split React and React-DOM into their own chunks
          vendor: ['react', 'react-dom'],

          // If you have any large third-party libraries you use a lot, you can manually chunk them here
          socket: ['socket.io-client']
        }
      }
    }
  }
})
