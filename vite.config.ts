import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Render provides the RENDER_EXTERNAL_HOSTNAME environment variable
const renderHostname = process.env.RENDER_EXTERNAL_HOSTNAME;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api': {
          target: 'http://localhost:5001',
          changeOrigin: true,
          secure: false,
          ws: true
        },
      },
      // Allow requests from the Render deployment host
      allowedHosts: renderHostname
        ? [renderHostname]
        : ['ai-content-hub-tf5r.onrender.com'], // Fallback for your specific URL
    },
    define: {
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
    },
  };
});
