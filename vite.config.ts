import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    // The live preview is served behind a proxy host — allow any Host header.
    allowedHosts: true,
  },
  preview: {
    host: true,
    allowedHosts: true,
  },
});
