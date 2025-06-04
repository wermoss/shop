import { useCartStore } from "~/stores/shop/cart";

export default defineNuxtRouteMiddleware((to) => {
  if (to.path === "/shop/checkout") {
    const cartStore = useCartStore();
    if (cartStore.items.length === 0) {
      return navigateTo("/shop");
    }
  }
});
