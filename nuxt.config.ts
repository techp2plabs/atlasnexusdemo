export default defineNuxtConfig({
  compatibilityDate: '2026-10-17',
  ssr: false,
  // This browser-only demo does not need Nuxt's dynamic app manifest.
  // Disabling it avoids a Nuxt/Vite dev-server unresolved #app-manifest import.
  experimental: { appManifest: false },
  // Polling keeps Nuxt dev usable on macOS when native file watchers hit EMFILE.
  watchers: { chokidar: { usePolling: true, interval: 1000 } },
  vite: { server: { watch: { usePolling: true, interval: 1000 } } },
  devtools: { enabled: false },
  modules: ['@pinia/nuxt'],
  pinia: { storesDirs: [] },
  imports: { dirs: [] },
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
    },
  },
  runtimeConfig: {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    geminiModel: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    public: {
      demoMode: process.env.NODE_ENV !== 'production',
    },
  },
  app: {
    head: {
      title: 'Atlas Nexus — Creator partnerships, made clear',
      meta: [
        { name: 'description', content: 'A guided demo of creator discovery, AI fit review, channel reporting, and network visibility.' },
        { name: 'theme-color', content: '#f6f5f9' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap' },
      ],
    },
  },
})
