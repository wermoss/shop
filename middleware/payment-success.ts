export default defineNuxtRouteMiddleware((to) => {
  console.log("Payment success middleware - route:", to.fullPath);

  if (to.path === "/shop/success") {
    // Sprawdź czy mamy numer zamówienia w URL
    if (!to.query.order) {
      console.warn("Brak numeru zamówienia w URL");
      return navigateTo("/shop");
    }

    // Sprawdź czy użytkownik ma uprawnienia do oglądania tego zamówienia
    const orderNumber = to.query.order as string;
    const storedOrders = sessionStorage.getItem("authorized_orders");
    let authorizedOrders: string[] = [];

    if (storedOrders) {
      try {
        authorizedOrders = JSON.parse(storedOrders);
      } catch (e) {
        console.error("Błąd parsowania listy autoryzowanych zamówień:", e);
      }
    }

    // Sprawdź czy numer zamówienia jest na liście autoryzowanych
    if (!authorizedOrders.includes(orderNumber)) {
      console.warn("Brak uprawnień do wyświetlenia zamówienia:", orderNumber);
      return navigateTo("/shop");
    }
  }
});
