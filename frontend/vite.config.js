import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/Auth': 'http://localhost:3001',
      '/Student': 'http://localhost:3001',
      '/Teacher': 'http://localhost:3001',
      '/Parent': 'http://localhost:3001',
      '/Admin': 'http://localhost:3001',
      '/Home': 'http://localhost:3001',
      '/Notification': 'http://localhost:3001',
      '/Profile': 'http://localhost:3001',
      '/api': 'http://localhost:3001',
      '/css': 'http://localhost:3001',
      '/images': 'http://localhost:3001',
      '/js': 'http://localhost:3001',
      '/lib': 'http://localhost:3001',
      '/uploads': 'http://localhost:3001',
      '/notificationHub': {
        target: 'http://localhost:3001',
        ws: true
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('axios')) {
              return 'vendor-axios';
            }
            return 'vendor';
          }
        }
      }
    }
  }
});
