export default defineNuxtRouteMiddleware((to, from) => {
  try {
    console.log("Payment Success Middleware - Route:", to.path);
    console.log("Payment Success Middleware - Query:", to.query);

    // Upewnij się, że jesteśmy na stronie success i mamy numer zamówienia
    if (to.path === "/shop/checkout/success") {
      if (!to.query.order) {
        console.warn("No order number provided in success page URL");
        return navigateTo("/shop/cart");
      }

      // Sprawdź, czy numer zamówienia ma poprawny format (litera + 6 cyfr)
      const orderNumber = to.query.order as string;
      console.log("Order number validation:", orderNumber);
      if (!/^[A-Z]\d{6}$/.test(orderNumber)) {
        console.warn("Invalid order number format:", orderNumber);
        return navigateTo("/shop/cart");
      }
    }
  } catch (error) {
    console.error("Error in payment-success middleware:", error);
    return navigateTo("/shop/cart");
  }
});
