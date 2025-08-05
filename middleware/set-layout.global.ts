// This middleware checks for specific routes that should use the clean layout
export default defineNuxtRouteMiddleware((to) => {
  // Apply clean layout to success page and layout-test page
  if (to.path === "/shop/success" || to.path === "/layout-testa") {
    setPageLayout("clean");
  }
  if (to.path === "/shop/temp/layout-test") {
    setPageLayout("laytest");
  }
});
