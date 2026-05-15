// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  future: { compatibilityVersion: 4 },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/supabase',
  ],

  supabase: {
    redirect: false,
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY,
  },

  runtimeConfig: {
    groqApiKey: process.env.GROQ_API_KEY,
    unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    sePayApiKey: process.env.SEPAY_API_KEY,
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    },
  },

  routeRules: {
    '/api/generate': { cache: false },
    '/preview/**': { ssr: false },
  },

  typescript: {
    strict: true,
  },
})
