import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        watsonRoofing: resolve(__dirname, 'watson-roofing.html'),
        amp: resolve(__dirname, 'amp.html'),
        cinematic: resolve(__dirname, 'cinematic.html')
      }
    }
  }
});
