export default defineNuxtPlugin((nuxtApp) => {
  if (process.env.NODE_ENV === "development") {
    console.log("Shop application initialized in development mode");
  }
});
