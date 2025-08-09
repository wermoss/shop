import { defineEventHandler } from "h3";

/**
 * Test endpoint do sprawdzenia wysyłki maila do influencera
 * bezpośrednio przez endpoint order-confirmation
 */
export default defineEventHandler(async (event) => {
  console.log("🧪 [Test Order Confirmation Flow] Starting test");

  // Przygotujmy przykładowe dane zamówienia
  const mockOrderDetails = {
    orderNumber: `TEST-${Math.floor(Math.random() * 10000)}`,
    customerName: "Jan Testowy",
    customerEmail: "test@example.com",
    customerPhone: "+48123456789",
    shippingAddress: {
      street: "Testowa",
      houseNumber: "123",
      postalCode: "00-001",
      city: "Warszawa",
      country: "Polska",
    },
    // Dane finansowe
    subtotalAmount: 199.99,
    cartDiscountPercent: 0,
    cartDiscountAmount: 0,
    codeDiscountPercent: 10,
    codeDiscountAmount: 20,
    totalDiscountAmount: 20,
    appliedDiscountCode: "TESTCODE",
    amount: 179.99,
    // Produkty
    items: [
      {
        name: "Test Product",
        quantity: 2,
        unitPrice: 99.99,
        totalPrice: 199.98,
        priceWithDiscount: 179.98,
        discountAmount: 20,
        image: "",
      },
    ],
  };

  const payload = {
    customerEmail: "test@example.com",
    influencerEmail: "services@wooboo.pl", // Użyj adresu administratora do testów
    orderDetails: mockOrderDetails,
  };

  console.log(
    "🧪 [Test Order Confirmation Flow] Prepared payload:",
    JSON.stringify(payload, null, 2)
  );

  try {
    // Użyj bazowego URL dla spójności
    const headers = event.node.req.headers;
    const protocol = headers["x-forwarded-proto"] || "http";
    const host = headers["x-forwarded-host"] || headers.host;
    const baseUrl = `${protocol}://${host}`;

    const orderConfirmationUrl = `${baseUrl}/api/mail/order-confirmation`;
    console.log(
      `🧪 [Test Order Confirmation Flow] Calling order confirmation API: ${orderConfirmationUrl}`
    );

    // Wywołaj endpoint order-confirmation
    const result = await $fetch(orderConfirmationUrl, {
      method: "POST",
      body: payload,
    });

    console.log("🧪 [Test Order Confirmation Flow] Result:", result);

    return {
      success: true,
      message: "Test completed successfully",
      result: result,
    };
  } catch (error: any) {
    console.error("❌ [Test Order Confirmation Flow] Error:", error);
    return {
      success: false,
      message: "Test failed",
      error: error.message || "Unknown error",
    };
  }
});
