import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, '.')
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        notFound: resolve(__dirname, '404.html'),
        aboutUs: resolve(__dirname, 'aboutus.html'),
        websiteDesign: resolve(__dirname, 'website-design/index.html'),
        websiteMaintenance: resolve(__dirname, 'website-maintenance/index.html'),
        localSeo: resolve(__dirname, 'local-seo/index.html'),
        accessibility: resolve(__dirname, 'accessibility/index.html'),
        privacyPolicy: resolve(__dirname, 'privacy-policy/index.html'),
        termsOfService: resolve(__dirname, 'terms-of-service/index.html'),
        disclaimer: resolve(__dirname, 'disclaimer/index.html'),
        watsonRoofing: resolve(__dirname, 'watson-roofing.html'),
        amp: resolve(__dirname, 'amp.html'),
        cinematic: resolve(__dirname, 'cinematic.html')
      }
    }
  }
});
