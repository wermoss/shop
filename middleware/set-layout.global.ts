// This middleware checks for specific routes that should use the clean layout
export default defineNuxtRouteMiddleware((to) => {
  // Apply clean layout to success page
  if (to.path === "/shop/success") {
    setPageLayout("clean");
  }
});
