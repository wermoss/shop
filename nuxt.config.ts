// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  ssr: false,

  nitro: {
    compatibilityDate: "2025-06-09", // Updated to fix compatibility warning
    preset: "vercel",
  },

  app: {
    layoutTransition: { name: "layout", mode: "out-in" },
  },

  css: ["~/assets/css/hamburgers.css", "mapbox-gl/dist/mapbox-gl.css"],

  modules: [
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "@nuxtjs/tailwindcss",
    "@vee-validate/nuxt",
    "@nuxtjs/google-fonts",
  ],

  googleFonts: {
    families: {
      "Roboto+Mono": {
        wght: [400],
      },
    },
    display: "swap",
    download: true,
    preconnect: true,
  },

  build: {
    transpile: ["pinia-plugin-persistedstate"],
  },

  veeValidate: {
    // Generuje automatycznie komponenty walidacji
    autoImports: true,
    // Konfiguracja komponentów
    componentNames: {
      Form: "VeeForm",
      Field: "VeeField",
      FieldArray: "VeeFieldArray",
      ErrorMessage: "VeeErrorMessage",
    },
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
      adminEmail: process.env.ADMIN_EMAIL || "konrad@wooboo.pl",
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
      mapboxToken: process.env.NUXT_PUBLIC_MAPBOX_TOKEN,
    },
  },
});
