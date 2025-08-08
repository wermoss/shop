import { defineNuxtRouteMiddleware, navigateTo } from "#imports";

export default defineNuxtRouteMiddleware((to) => {
  // Sprawdź czy jest to strona sukcesu zamówienia
  if (to.path.includes("/shop/success")) {
    const order = to.query.order;
    const timestamp = to.query.timestamp;
    const signature = to.query.signature;

    // Sprawdź czy wszystkie wymagane parametry są obecne
    if (!order || !timestamp || !signature) {
      console.error("Brak wymaganych parametrów w URL");
      // Przekieruj tylko jeśli faktycznie brakuje parametrów
      return navigateTo("/shop");
    }

    // Middleware nie blokuje dostępu - właściwa weryfikacja jest wykonywana przez API
  }
});
