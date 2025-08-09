import { defineEventHandler } from "h3";

interface Product {
  id: number;
  n?: string; // Compressed format
  name?: string; // Full format
  p?: number; // Compressed format - price
  price?: number; // Full format - price
  q?: number; // Compressed format - quantity
  quantity?: number; // Full format - quantity
  d?: number; // Compressed format - discount
  f?: number; // Compressed format - final price
  image?: string;
}

interface NotificationResult {
  success: boolean;
  data?: any;
  recipients?: {
    influencer: string;
    admin: string;
  };
  error?: any;
}

/**
 * This endpoint simulates the exact code from success.vue that handles
 * influencer notification, to verify that the logic works correctly
 */
export default defineEventHandler(async (event) => {
  console.log("🧪 [Test Success Page Flow] Starting test");

  // Mock sessionStorage data for an order with influencer
  const orderNumber = `TEST-${Math.floor(Math.random() * 10000)}`;
  const mockStoredData = {
    orderNumber: orderNumber,
    customerName: "Test Customer",
    customerEmail: "test@example.com",
    influencerEmail: "services@wooboo.pl", // For testing, use admin email
    appliedDiscountCode: "TESTCODE",
    subtotalAmount: "199.99",
    finalAmount: "179.99",
    codeDiscountPercent: "10",
    // Testing with compressed product format
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

  console.log(
    "🧪 [Test Success Page Flow] Mock session storage data:",
    mockStoredData
  );

  try {
    const parsedData = mockStoredData;
    console.log("🧪 [Test Success Page Flow] Parsed data:", parsedData);

    // This is the exact logic from success.vue
    if (
      parsedData.influencerEmail &&
      parsedData.influencerEmail.trim() !== ""
    ) {
      console.log(
        `📧 [Test Success Page Flow] Detected influencer email: ${parsedData.influencerEmail}, sending notification`
      );

      // Prepare data for notification API - identical to success.vue
      const completePayload = {
        influencerEmail: parsedData.influencerEmail,
        orderDetails: {
          customerName: parsedData.customerName,
          customerEmail: parsedData.customerEmail,
          orderNumber: parsedData.orderNumber,
          appliedDiscountCode: parsedData.appliedDiscountCode || "",
          // Prepare product data in expected format - identical to success.vue
          items: parsedData.products
            ? JSON.parse(parsedData.products).map((item: Product) => {
                // Handle both compressed and full product data format
                const isCompressed = item.n !== undefined;
                return {
                  product: {
                    id: item.id || 0,
                    name: isCompressed ? item.n : item.name,
                    price: isCompressed ? item.p : item.price,
                    image: item.image || "",
                    description: "",
                  },
                  quantity: isCompressed ? item.q : item.quantity,
                };
              })
            : [],
          subtotalAmount: parseFloat(parsedData.subtotalAmount),
          finalAmount: parseFloat(parsedData.finalAmount),
          codeDiscountPercent: parseFloat(parsedData.codeDiscountPercent),
        },
      };

      console.log(
        `📧 [Test Success Page Flow] Sending notification payload:`,
        JSON.stringify(completePayload, null, 2)
      );

      try {
        // Call notification API - identical to success.vue
        const notificationResult = await $fetch<NotificationResult>(
          "/api/mail/influencer-notification",
          {
            method: "POST",
            body: completePayload,
            timeout: 30000,
          }
        );

        console.log(
          `📧 [Test Success Page Flow] Notification result:`,
          notificationResult
        );

        if (notificationResult.success) {
          console.log(
            `✅ [Test Success Page Flow] Influencer notification sent successfully`
          );
          return {
            success: true,
            message: "Success page notification flow worked correctly",
            result: notificationResult,
          };
        } else {
          console.error(
            `❌ [Test Success Page Flow] Failed to send influencer notification:`,
            notificationResult.error
          );
          return {
            success: false,
            message: "Failed to send notification",
            error: notificationResult.error,
          };
        }
      } catch (error) {
        const notificationError = error as Error;
        console.error(
          `❌ [Test Success Page Flow] Error calling notification API:`,
          notificationError
        );
        return {
          success: false,
          message: "Error calling notification API",
          error: notificationError.message,
        };
      }
    } else {
      console.log(
        `ℹ️ [Test Success Page Flow] No influencer email found in order data`
      );
      return {
        success: false,
        message: "No influencer email in test data",
      };
    }
  } catch (error) {
    const e = error as Error;
    console.error("❌ [Test Success Page Flow] Error:", e);
    return {
      success: false,
      message: "Test error",
      error: e.message,
    };
  }
});
