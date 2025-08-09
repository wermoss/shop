import { defineEventHandler } from "h3";

/**
 * Endpoint testowy do symulowania pełnego procesu webhook → influencer notification
 */
export default defineEventHandler(async (event) => {
  console.log("🔄 [Test Webhook to Influencer] Starting test");

  try {
    // Pobierz informacje o hoście i zbuduj bazowy URL
    const headers = event.node.req.headers;
    const protocol = headers["x-forwarded-proto"] || "http";
    const host = headers["x-forwarded-host"] || headers.host;
    const baseUrl = `${protocol}://${host}`;

    console.log(`🔄 [Test Webhook to Influencer] Host info:`, {
      protocol,
      host,
      baseUrl,
    });

    // Dane symulujące sesję Stripe
    const sessionData = {
      metadata: {
        orderNumber: "TEST-" + Date.now().toString().slice(-6),
        customerName: "Testowy Klient",
        customerEmail: "test@example.com",
        customerPhone: "123456789",
        appliedDiscountCode: "INFL01",
        influencerEmail: "konrad@minister.com", // Email influencera do testu
      },
    };

    // Symulacja emailProducts
    const emailProducts = [
      {
        name: "Produkt Testowy 1",
        quantity: 2,
        unitPrice: 100,
        price: 100,
        totalPrice: 200,
        priceWithDiscount: 170,
        discountAmount: 30,
        image: "",
      },
      {
        name: "Produkt Testowy 2",
        quantity: 1,
        unitPrice: 200,
        price: 200,
        totalPrice: 200,
        priceWithDiscount: 170,
        discountAmount: 30,
        image: "",
      },
    ];

    // Kwoty i rabaty
    const subtotalAmount = 400;
    const finalAmount = 340;
    const codeDiscountPercent = 15;

    console.log(`🔄 [Test Webhook to Influencer] Session data prepared`);

    // Pobranie email influencera z metadanych sesji
    const influencerEmail = sessionData.metadata?.influencerEmail;

    if (influencerEmail) {
      console.log(
        `🔄 [Test Webhook to Influencer] Found influencer email: ${influencerEmail}`
      );

      // Adres URL endpointu influencer-notification
      const influencerNotificationUrl = `${baseUrl}/api/mail/influencer-notification`;
      console.log(
        `🔄 [Test Webhook to Influencer] Using notification URL: ${influencerNotificationUrl}`
      );

      // Przygotowanie payloadu
      const completePayload = {
        influencerEmail,
        orderDetails: {
          customerName: sessionData.metadata?.customerName,
          customerEmail: sessionData.metadata?.customerEmail,
          orderNumber: sessionData.metadata?.orderNumber,
          appliedDiscountCode: sessionData.metadata?.appliedDiscountCode || "",
          items: emailProducts.map((product) => ({
            product: {
              id: 0,
              name: product.name,
              price: product.unitPrice,
              image: product.image || "",
              description: "",
            },
            quantity: product.quantity,
          })),
          subtotalAmount,
          finalAmount,
          codeDiscountPercent,
        },
      };

      console.log(
        `🔄 [Test Webhook to Influencer] Complete payload:`,
        JSON.stringify(completePayload, null, 2)
      );

      // Wywołanie endpointu
      const influencerNotificationResult = await $fetch(
        influencerNotificationUrl,
        {
          method: "POST",
          body: completePayload,
          headers: {
            "Content-Type": "application/json",
          },
          // Długi timeout
          timeout: 30000,
        }
      );

      console.log(
        `🔄 [Test Webhook to Influencer] Notification result:`,
        JSON.stringify(influencerNotificationResult, null, 2)
      );

      return {
        success: true,
        message: "Test webhook to influencer completed",
        result: influencerNotificationResult,
      };
    } else {
      console.log(
        `⚠️ [Test Webhook to Influencer] No influencer email found in session metadata`
      );
      return {
        success: false,
        error: "No influencer email found in session metadata",
      };
    }
  } catch (error: any) {
    console.error(`❌ [Test Webhook to Influencer] Error:`, error);
    console.error(`❌ [Test Webhook to Influencer] Error details:`, {
      message: error.message || "Unknown error",
      name: error.name,
      stack: error.stack,
    });

    return {
      success: false,
      error: error.message || "An unknown error occurred",
      errorName: error.name,
      errorStack: error.stack
        ? error.stack.split("\n").slice(0, 3).join("\n")
        : null,
    };
  }
});
