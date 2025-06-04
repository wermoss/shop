// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  ssr: false,

  modules: ["@pinia/nuxt", "@vueuse/nuxt", "@nuxtjs/tailwindcss"],

  nitro: {
    preset: "vercel",
  },

  routeRules: {
    "/": { ssr: false },
    "/shop": { ssr: false },
    "/shop/**": { ssr: false },
  },

  runtimeConfig: {
    useTestKeys: process.env.USE_TEST_KEYS === "true",
    brevo: {
      apiKey: process.env.BREVO_API_KEY,
      adminEmail: "konrad@wooboo.pl",
    },
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
