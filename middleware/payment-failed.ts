export default defineNuxtRouteMiddleware((to) => {
  console.log("Payment failed middleware - route:", to.fullPath);

  if (to.path === "/shop/failed") {
    if (!to.query.order) {
      console.warn("No order number in URL");
      return navigateTo("/shop");
    }
  }
});
