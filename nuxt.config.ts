// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    'nuxt-auth-utils',
  ],

  css: ['~/assets/css/main.css'],

  ui: {
    colorMode: false, // We'll handle dark mode manually (dark only)
  },

  // Runtime config for environment variables
  runtimeConfig: {
    sessionPassword: process.env.NUXT_SESSION_PASSWORD || 'at-least-32-characters-long-secret-key',
    adminUsername: process.env.ADMIN_USERNAME || 'admin',
    adminPassword: process.env.ADMIN_PASSWORD || 'changeme',
  },

  // App head configuration
  app: {
    head: {
      title: 'Rowans Rota',
      meta: [
        { name: 'description', content: 'DJ Schedule Management' },
        { name: 'theme-color', content: '#1a1a1a' },
      ],
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap',
        },
      ],
    },
  },

  // Nitro server configuration
  nitro: {
    experimental: {
      asyncContext: true,
    },
  },
})
