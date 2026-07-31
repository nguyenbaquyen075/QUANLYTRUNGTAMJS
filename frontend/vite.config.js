import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// These path prefixes are owned by BOTH the legacy EJS backend (as data
// endpoints for useFetchData) AND React Router (as client-side page routes).
// A real AJAX call from the frontend always sends X-Requested-With, so only
// those should be proxied to the backend. A plain browser navigation (new
// tab, hard refresh, typed URL) has no such header and must fall through to
// index.html so React Router can render the matching page instead of the
// old EJS view.
const spaRouteBypass = (req) => {
  const isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest';
  const accepts = req.headers.accept || '';
  if (!isAjax && req.method === 'GET' && accepts.includes('text/html')) {
    return '/index.html';
  }
};

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/Auth': 'http://localhost:3001',
      '/Student': { target: 'http://localhost:3001', bypass: spaRouteBypass },
      '/Teacher': { target: 'http://localhost:3001', bypass: spaRouteBypass },
      '/Parent': 'http://localhost:3001',
      '/Admin': { target: 'http://localhost:3001', bypass: spaRouteBypass },
      '/Home': { target: 'http://localhost:3001', bypass: spaRouteBypass },
      '/Notification': { target: 'http://localhost:3001', bypass: spaRouteBypass },
      '/Profile': { target: 'http://localhost:3001', bypass: spaRouteBypass },
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
