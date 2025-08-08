import { defineEventHandler } from "h3";

export default defineEventHandler(async (event) => {
  console.log("📧 [Test] Manually triggering order confirmation email");

  // Create sample order data for testing
  const sampleOrderData = {
    customerEmail: "test@example.com", // Change this to your email for testing
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
      cartDiscountPercent: 10,
      cartDiscountAmount: 120,
      codeDiscountPercent: 0,
      codeDiscountAmount: 0,
      totalDiscountAmount: 120,
      appliedDiscountCode: "",
      amount: 1080,
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
    // Call the order confirmation endpoint directly
    const response = await $fetch("/api/mail/order-confirmation", {
      method: "POST",
      body: sampleOrderData,
    });

    console.log("📧 [Test] Order confirmation response:", response);

    return {
      success: true,
      message: "Test order confirmation email triggered",
      response,
    };
  } catch (error) {
    console.error(
      "❌ [Test] Failed to trigger order confirmation email:",
      error
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
});
