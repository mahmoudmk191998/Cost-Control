import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Use relative paths for assets by default — safer for many static hosts and subpath deployments
  base: './',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'حساب تكلفة الوصفات',
        short_name: 'حساب الوصفات',
        description: 'احسب تكلفة المكونات والوصفات بدقة - بالجنيه المصري',
        theme_color: '#4F8EF7',
        background_color: '#F5F7FA',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'ar',
        dir: 'rtl',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
    ,
    // Small plugin: after build write convenient files for static hosts
    {
      name: 'static-hosting-fixes',
      closeBundle: async () => {
        try {
          const fs = await import('fs')
          const path = await import('path')
          const out = path.resolve(__dirname, 'dist')
          // _redirects for Netlify/Surge
          const redirects = '/* /index.html 200'
          fs.writeFileSync(path.join(out, '_redirects'), redirects, 'utf8')
          // 200.html (some hosts use this for SPA fallback)
          const indexHtml = fs.readFileSync(path.join(out, 'index.html'), 'utf8')
          fs.writeFileSync(path.join(out, '200.html'), indexHtml, 'utf8')
        } catch (e) {
          // non-fatal — log for debugging
          // eslint-disable-next-line no-console
          console.warn('static-hosting-fixes plugin failed', e)
        }
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
