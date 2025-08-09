import { defineEventHandler } from "h3";

export default defineEventHandler(async (event) => {
  console.log(
    "📧 [Test] Rozpoczynam test wysyłki powiadomienia dla influencera"
  );

  try {
    // Pobierz informacje o hoście i zbuduj bazowy URL
    const headers = event.node.req.headers;
    const protocol = headers["x-forwarded-proto"] || "http";
    const host = headers["x-forwarded-host"] || headers.host;
    const baseUrl = `${protocol}://${host}`;

    console.log(`📧 [Test] Informacje o hoście:`, {
      protocol,
      host,
      baseUrl,
    });

    // Dane testowe dla influencera
    const influencerData = {
      influencerEmail: "konrad@minister.com",
      orderDetails: {
        customerName: "Test Customer",
        customerEmail: "test@example.com",
        orderNumber: "TEST" + Date.now().toString().slice(-6),
        appliedDiscountCode: "INFL01",
        items: [
          {
            product: {
              id: 1,
              name: "Test Product 1",
              price: 300,
              image: "",
              description: "Test product description",
            },
            quantity: 2,
          },
          {
            product: {
              id: 2,
              name: "Test Product 2",
              price: 300,
              image: "",
              description: "Test product description",
            },
            quantity: 2,
          },
        ],
        subtotalAmount: 1200,
        finalAmount: 1020,
        codeDiscountPercent: 15,
      },
    };

    console.log(
      "📧 [Test] Dane do wysyłki:",
      JSON.stringify(influencerData, null, 2)
    );

    const influencerNotificationUrl = `${baseUrl}/api/mail/influencer-notification`;
    console.log(
      `📧 [Test] Pełny URL dla endpointu powiadomień: ${influencerNotificationUrl}`
    );

    console.log("📧 [Test] Wywołuję endpoint powiadomień dla influencera");
    const influencerResponse = await $fetch(influencerNotificationUrl, {
      method: "POST",
      body: influencerData,
    });

    console.log(
      "📧 [Test] Odpowiedź z endpointu powiadomień:",
      JSON.stringify(influencerResponse, null, 2)
    );

    return {
      success: true,
      message: "Test wysyłki do influencera zakończony",
      response: influencerResponse,
    };
  } catch (error: any) {
    console.error(
      "❌ [Test] Błąd podczas testu wysyłki do influencera:",
      error
    );
    console.error("❌ [Test] Szczegóły błędu:", {
      message: error.message || "Unknown error",
      name: error.name,
      stack: error.stack,
    });

    return {
      success: false,
      error: error.message || "Nieznany błąd",
      details: {
        name: error.name,
        stack: error.stack?.split("\n").slice(0, 3).join("\n"),
      },
    };
  }
});
