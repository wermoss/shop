// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: "2025-06-03",
  modules: ["@pinia/nuxt", "@vueuse/nuxt", "@nuxtjs/tailwindcss"],

  // Włącz SSR globalnie
  ssr: true,

  // Konfiguracja nitro dla lepszej obsługi routingu
  nitro: {
    routeRules: {
      "/": { ssr: true },
      "/shop/**": { ssr: true },
    },
  },

  app: {
    // Konfiguracja head dla lepszego SEO i ładowania
    head: {
      htmlAttrs: {
        lang: "pl",
      },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
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
});
