export default defineNuxtPlugin((nuxtApp) => {
  console.log("Debug plugin - starting app");

  nuxtApp.vueApp.mixin({
    mounted() {
      console.log("Component mounted:", this.$options.name || "anonymous");
    },
    beforeMount() {
      console.log("Component beforeMount:", this.$options.name || "anonymous");
    },
  });
});
