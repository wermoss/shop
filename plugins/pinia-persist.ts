import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

export default defineNuxtPlugin((nuxtApp) => {
  // Dodajemy wtyczkę do Pinia tylko po stronie klienta
  if (process.client) {
    nuxtApp.$pinia.use(piniaPluginPersistedstate);
  }
});
