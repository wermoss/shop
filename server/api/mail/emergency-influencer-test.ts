import { defineEventHandler } from "h3";

/**
 * Test endpoint do bezpośredniego wywołania powiadomień do influencera.
 * Próbuje wszystkich możliwych sposobów wysyłki maila do influencera.
 */
export default defineEventHandler(async (event) => {
  console.log(
    "🚨 [Emergency Test] Starting EMERGENCY influencer notification test"
  );

  // Dane testowe
  const testOrderNumber = `EMERGENCY-${Math.floor(Math.random() * 10000)}`;
  const testInfluencerEmail = "services@wooboo.pl"; // For testing purposes
  const testCustomerEmail = "test@example.com";

  console.log(`🚨 [Emergency Test] Order number: ${testOrderNumber}`);
  console.log(`🚨 [Emergency Test] Influencer email: ${testInfluencerEmail}`);

  // 1. METODA 1: Bezpośrednie wywołanie influencer-notification
  try {
    console.log(
      "🚨 [Emergency Test] METHOD 1: Direct influencer-notification call"
    );

    const payload1 = {
      influencerEmail: testInfluencerEmail,
      orderDetails: {
        customerName: "Emergency Test",
        customerEmail: testCustomerEmail,
        orderNumber: testOrderNumber + "-M1",
        appliedDiscountCode: "EMERGENCY",
        items: [
          {
            product: {
              id: 1,
              name: "Emergency Test Product",
              price: 100,
              image: "",
              description: "",
            },
            quantity: 1,
          },
        ],
        subtotalAmount: 100,
        finalAmount: 100,
        codeDiscountPercent: 15,
      },
    };

    console.log(
      "🚨 [Emergency Test] METHOD 1 payload:",
      JSON.stringify(payload1, null, 2)
    );

    const result1 = await $fetch("/api/mail/influencer-notification", {
      method: "POST",
      body: payload1,
      timeout: 60000,
    });

    console.log(
      "🚨 [Emergency Test] METHOD 1 result:",
      JSON.stringify(result1, null, 2)
    );
  } catch (error) {
    console.error("❌ [Emergency Test] METHOD 1 error:", error);
  }

  // 2. METODA 2: Wywołanie przez order-confirmation
  try {
    console.log("🚨 [Emergency Test] METHOD 2: Via order-confirmation");

    const payload2 = {
      customerEmail: testCustomerEmail,
      influencerEmail: testInfluencerEmail,
      orderDetails: {
        orderNumber: testOrderNumber + "-M2",
        customerName: "Emergency Test",
        customerEmail: testCustomerEmail,
        customerPhone: "+48123456789",
        shippingAddress: {
          street: "Emergency",
          houseNumber: "911",
          postalCode: "00-000",
          city: "Warsaw",
          country: "Poland",
        },
        subtotalAmount: 100,
        cartDiscountPercent: 0,
        cartDiscountAmount: 0,
        codeDiscountPercent: 15,
        codeDiscountAmount: 15,
        totalDiscountAmount: 15,
        appliedDiscountCode: "EMERGENCY",
        amount: 85,
        items: [
          {
            name: "Emergency Test Product",
            quantity: 1,
            unitPrice: 100,
            totalPrice: 100,
            priceWithDiscount: 85,
            discountAmount: 15,
            image: "",
          },
        ],
      },
    };

    console.log(
      "🚨 [Emergency Test] METHOD 2 payload:",
      JSON.stringify(payload2, null, 2)
    );

    const result2 = await $fetch("/api/mail/order-confirmation", {
      method: "POST",
      body: payload2,
      timeout: 60000,
    });

    console.log(
      "🚨 [Emergency Test] METHOD 2 result:",
      JSON.stringify(result2, null, 2)
    );
  } catch (error) {
    console.error("❌ [Emergency Test] METHOD 2 error:", error);
  }

  // 3. METODA 3: Raw fetch do API Brevo
  try {
    console.log("🚨 [Emergency Test] METHOD 3: Direct Brevo API call");

    // Pobieramy klucz API
    const config = useRuntimeConfig();
    const apiKey = config.brevo?.apiKey;

    if (!apiKey) {
      console.error("❌ [Emergency Test] METHOD 3: No API key available");
    } else {
      const emailData = {
        sender: {
          name: "NuxtShop Emergency",
          email: "services@lexxo.pl",
        },
        to: [
          {
            email: testInfluencerEmail,
            name: "Partner NuxtShop",
          },
        ],
        subject: `EMERGENCY TEST - Kod rabatowy został wykorzystany! ${testOrderNumber}-M3`,
        htmlContent: `
          <html>
            <body>
              <h1>EMERGENCY TEST EMAIL</h1>
              <p>To jest testowy email wysłany bezpośrednio przez API Brevo.</p>
              <p>Order number: ${testOrderNumber}-M3</p>
              <p>Influencer email: ${testInfluencerEmail}</p>
            </body>
          </html>
        `,
      };

      // Wysyłamy bezpośrednio przez API Brevo
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
        body: JSON.stringify(emailData),
      });

      const responseData = await response.json();
      console.log(
        "🚨 [Emergency Test] METHOD 3 result:",
        JSON.stringify(responseData, null, 2)
      );
    }
  } catch (error) {
    console.error("❌ [Emergency Test] METHOD 3 error:", error);
  }

  return {
    success: true,
    message: "Emergency test completed. Check server logs for details.",
  };
});
