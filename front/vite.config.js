// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    // Base public path when served in production
    base: './',
    
    // Configure the server
    server: {
      port: 3000,
      open: true, // Open browser on server start
    },
    
    // Configure build
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
    },
    
    // CSS configuration
    css: {
      // Enable CSS source maps in development
      devSourcemap: true,
    },
    
    // Define aliases
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    
    // Make env variables available to the app
    define: {
      // Pass all env variables starting with VITE_
      ...Object.keys(env).reduce((acc, key) => {
        if (key.startsWith('VITE_')) {
          acc[`import.meta.env.${key}`] = JSON.stringify(env[key]);
        }
        return acc;
      }, {}),
    },
  };
});
