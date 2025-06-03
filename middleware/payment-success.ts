export default defineNuxtRouteMiddleware(async (to) => {
  // Sprawdź czy jesteśmy na stronie success
  if (to.path === "/shop/checkout/success") {
    // Sprawdź czy mamy numer zamówienia
    const orderNumber = to.query.order as string;

    if (!orderNumber) {
      console.warn("Brak numeru zamówienia w URL");
      return navigateTo("/shop");
    }

    // Sprawdź format numeru zamówienia (litera + 6 cyfr)
    if (!/^[A-Z]\d{6}$/.test(orderNumber)) {
      console.warn("Nieprawidłowy format numeru zamówienia:", orderNumber);
      return navigateTo("/shop");
    }
  }
});
