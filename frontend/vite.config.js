import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Scan all HTML files dynamically as entry points
const htmlFiles = {};
fs.readdirSync(__dirname).forEach(file => {
  if (file.endsWith('.html')) {
    const name = path.basename(file, '.html');
    htmlFiles[name] = path.resolve(__dirname, file);
  }
});

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
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  }
});
