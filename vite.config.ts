import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Explicitly include only essential dependencies to avoid circular references
    include: ['react', 'react-dom', 'react-router-dom'],
    // Exclude any problematic dependencies if needed
    exclude: []
  },
  build: {
    // Increase chunk size limit to handle larger modules
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  // Configure esbuild options to handle large files
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
});