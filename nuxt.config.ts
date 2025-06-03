// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: "2025-06-03",
  modules: ["@pinia/nuxt", "@vueuse/nuxt", "@nuxtjs/tailwindcss"],

  // Konfiguracja SSR
  ssr: true,

  // Konfiguracja serwera
  nitro: {
    routeRules: {
      "/shop/checkout/success": { ssr: true },
    },
  },

  runtimeConfig: {
    useTestKeys: process.env.USE_TEST_KEYS === "true",
    stripeSecretKey:
      process.env.USE_TEST_KEYS === "true"
        ? process.env.STRIPE_TEST_SECRET_KEY
        : process.env.STRIPE_LIVE_SECRET_KEY,
    stripeWebhookSecret:
      process.env.USE_TEST_KEYS === "true"
        ? process.env.STRIPE_TEST_WEBHOOK_SECRET
        : process.env.STRIPE_LIVE_WEBHOOK_SECRET,
    public: {
      stripePublicKey:
        process.env.USE_TEST_KEYS === "true"
          ? process.env.STRIPE_TEST_PUBLIC_KEY
          : process.env.STRIPE_LIVE_PUBLIC_KEY,
    },
  },

  // Dodanie pustej trasy dla Chrome DevTools
  routeRules: {
    "/.well-known/**": { cors: true },
  },
});
