import { defineEventHandler, getMethod } from "h3";

export default defineEventHandler(async (event) => {
  // Allow both POST and GET for testing purposes
  const method = getMethod(event);
  if (method !== "POST" && method !== "GET") {
    return { error: "Method not allowed" };
  }
  console.log("📧 [Test] Manually triggering test emails");

  // Create sample order data for testing
  const sampleOrderData = {
    customerEmail: "test@example.com", // Change this to your email for testing
    // Add influencer email for testing
    influencerEmail: "konrad@minister.com",
    orderDetails: {
      orderNumber: "TEST123",
      customerName: "Test Customer",
      customerEmail: "test@example.com", // Change this to your email for testing
      customerPhone: "123456789",
      shippingAddress: {
        street: "Test Street",
        houseNumber: "123",
        postalCode: "12-345",
        city: "Test City",
        country: "Poland",
      },
      subtotalAmount: 1200,
      cartDiscountPercent: 0,
      cartDiscountAmount: 0,
      codeDiscountPercent: 15,
      codeDiscountAmount: 180,
      totalDiscountAmount: 180,
      appliedDiscountCode: "INFL01",
      amount: 1020,
      items: [
        {
          name: "Test Product 1",
          quantity: 2,
          unitPrice: 300,
          totalPrice: 600,
          priceWithDiscount: 540,
          discountAmount: 60,
        },
        {
          name: "Test Product 2",
          quantity: 2,
          unitPrice: 300,
          totalPrice: 600,
          priceWithDiscount: 540,
          discountAmount: 60,
        },
      ],
    },
  };

  try {
    // Get the host and construct the base URL
    const headers = event.node.req.headers;
    const protocol = headers["x-forwarded-proto"] || "http";
    const host = headers["x-forwarded-host"] || headers.host;
    const baseUrl = `${protocol}://${host}`;

    // Call the order confirmation endpoint directly
    console.log("📧 [Test] Sending order confirmation email");
    const orderConfirmationUrl = `${baseUrl}/api/mail/order-confirmation`;
    console.log(
      `📧 [Test] Using full URL for order confirmation: ${orderConfirmationUrl}`
    );

    const orderConfirmationResponse = await $fetch(orderConfirmationUrl, {
      method: "POST",
      body: sampleOrderData,
    });

    console.log(
      "📧 [Test] Order confirmation response:",
      orderConfirmationResponse
    );

    // Now test the influencer notification
    console.log("📧 [Test] Sending influencer notification email");

    // Data for influencer notification
    const influencerData = {
      influencerEmail: "konrad@minister.com",
      orderDetails: {
        customerName: "Test Customer",
        customerEmail: "test@example.com",
        orderNumber: "TEST123",
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

    const influencerNotificationUrl = `${baseUrl}/api/mail/influencer-notification`;
    console.log(
      `📧 [Test] Using full URL for influencer notification: ${influencerNotificationUrl}`
    );

    const influencerResponse = await $fetch(influencerNotificationUrl, {
      method: "POST",
      body: influencerData,
    });

    console.log(
      "📧 [Test] Influencer notification response:",
      influencerResponse
    );

    return {
      success: true,
      message: "Test emails triggered",
      responses: {
        orderConfirmation: orderConfirmationResponse,
        influencerNotification: influencerResponse,
      },
    };
  } catch (error) {
    console.error("❌ [Test] Failed to trigger test emails:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
});
