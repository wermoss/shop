export default defineNuxtRouteMiddleware((to) => {
  console.log("Payment failed middleware - route:", to.fullPath);

  if (to.path === "/shop/failed") {
    // Sprawdź czy mamy numer zamówienia
    if (!to.query.order) {
      console.warn("No order number in URL");
      return navigateTo("/shop");
    }

    // Sprawdź czy mamy status z P24
    const paymentIntentStatus = to.query.payment_intent;
    let failureStatus = to.query.status || "failed";

    // Jeśli mamy status requires_payment_method, to znaczy że płatność nie powiodła się
    if (paymentIntentStatus === "requires_payment_method") {
      failureStatus = "failed";
    }

    // Store error details in the state
    const failureDetails = {
      orderNumber: to.query.order,
      message: to.query.reason || "Płatność nie powiodła się",
      errorCode: to.query.error_code || "unknown_error",
      status: failureStatus,
      timestamp: new Date().toISOString(),
    };

    // Use Nuxt's useState to store error details
    useState("paymentError", () => failureDetails);
  }
});
