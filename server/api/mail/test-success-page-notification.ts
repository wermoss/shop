import { defineEventHandler } from "h3";

/**
 * This endpoint simulates the success page calling the influencer notification API
 * It can be used to test if the notification flow works correctly
 */
export default defineEventHandler(async (event) => {
  console.log("🧪 [Test] Testing influencer notification from success page");

  // Mock data similar to what would be stored in sessionStorage
  const mockOrderData = {
    orderNumber: `TEST-${Math.floor(Math.random() * 10000)}`,
    customerName: "Test Customer",
    customerEmail: "test@example.com",
    influencerEmail: "services@wooboo.pl", // For testing, use your own email
    appliedDiscountCode: "TESTCODE",
    subtotalAmount: "199.99",
    finalAmount: "179.99",
    codeDiscountPercent: "10",
    products: JSON.stringify([
      {
        id: 1,
        n: "Test Product",
        p: 99.99,
        q: 2,
        d: 10,
        f: 179.99,
      },
    ]),
  };

  console.log("🧪 [Test] Mock order data:", mockOrderData);

  // Create the payload for the notification API
  const completePayload = {
    influencerEmail: mockOrderData.influencerEmail,
    orderDetails: {
      customerName: mockOrderData.customerName,
      customerEmail: mockOrderData.customerEmail,
      orderNumber: mockOrderData.orderNumber,
      appliedDiscountCode: mockOrderData.appliedDiscountCode || "",
      items: JSON.parse(mockOrderData.products).map((item) => ({
        product: {
          id: item.id || 0,
          name: item.n || item.name,
          price: item.p || item.price,
          image: "",
          description: "",
        },
        quantity: item.q || item.quantity,
      })),
      subtotalAmount: parseFloat(mockOrderData.subtotalAmount),
      finalAmount: parseFloat(mockOrderData.finalAmount),
      codeDiscountPercent: parseFloat(mockOrderData.codeDiscountPercent),
    },
  };

  console.log(
    "🧪 [Test] Notification payload:",
    JSON.stringify(completePayload, null, 2)
  );

  try {
    // Call the notification API directly
    const notificationResult = await $fetch(
      "/api/mail/influencer-notification",
      {
        method: "POST",
        body: completePayload,
        timeout: 30000,
      }
    );

    console.log("🧪 [Test] Notification result:", notificationResult);

    return {
      success: true,
      message: "Test completed successfully",
      result: notificationResult,
    };
  } catch (error) {
    console.error("❌ [Test] Error calling notification API:", error);
    return {
      success: false,
      message: "Test failed",
      error: error.message,
    };
  }
});
