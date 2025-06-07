import { defineEventHandler, readBody, readRawBody, getHeader } from "h3";
import Stripe from "stripe";

interface ProductDetail {
  id: number;
  qty: number;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: "2025-05-28.basil",
  });

  console.log("🔔 [Webhook] Endpoint hit");

  const signature = getHeader(event, "stripe-signature");
  const rawBody = await readRawBody(event);

  // Sprawdzamy źródło webhooka (StripeCD lub rzeczywisty)
  const webhookSource = getHeader(event, "user-agent") || "";
  const isStripeCLI = webhookSource.toLowerCase().includes("stripecli");

  console.log(
    `🔍 [Webhook] Source: ${
      isStripeCLI ? "Stripe CLI (local)" : "Stripe (production)"
    }`
  );

  if (!signature || !rawBody) {
    console.error("❌ [Webhook] No signature or body found");
    throw createError({
      statusCode: 400,
      message: "Missing signature or body",
    });
  }

  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      config.stripeWebhookSecret
    );
    console.log(
      `✅ [Webhook] Event verified successfully: ${stripeEvent.type} from ${
        isStripeCLI ? "CLI" : "production"
      }`
    );
  } catch (err) {
    console.error("❌ [Webhook] Signature verification failed:", err);
    throw createError({
      statusCode: 400,
      message: "Webhook signature verification failed",
    });
  }

  // Handle stripe events
  const session = stripeEvent.data.object as Stripe.Checkout.Session;

  // Only handle successful payments
  if (
    stripeEvent.type === "checkout.session.completed" &&
    session.payment_status === "paid"
  ) {
    console.log("💰 [Webhook] Processing completed checkout session:", {
      sessionId: session.id,
      orderNumber: session.metadata?.orderNumber,
      source: isStripeCLI ? "CLI" : "production",
    });

    // Sprawdź czy mail już został wysłany (niezależnie od źródła webhooka)
    if (session.metadata?.emailSent === "true") {
      console.log(
        `📧 [Webhook] Email already sent for this session (source: ${
          isStripeCLI ? "CLI" : "production"
        })`
      );
      return { success: true, status: "already_processed" };
    }

    try {
      if (!session.metadata?.productIds) {
        throw createError({
          statusCode: 400,
          message: "No product information in session",
        });
      }

      // Get product details
      console.log("📦 [Webhook] Processing order products");
      const productsData = await import("../../../data/products.json");
      const productDetails = JSON.parse(
        session.metadata.productIds
      ) as ProductDetail[];

      if (!Array.isArray(productDetails)) {
        throw createError({
          statusCode: 400,
          message: "Invalid product details format",
        });
      }

      // Calculate totals exactly as in cart-notification
      let subtotalAmount = 0;
      const cartDiscount = parseInt(session.metadata?.cartDiscount || "0");
      const codeDiscount = parseInt(session.metadata?.codeDiscount || "0");
      const totalDiscount = cartDiscount + codeDiscount;

      // Map products with prices (bez formatowania!)
      const emailProducts = [];

      // Najpierw oblicz subtotalAmount przez dodanie cen wszystkich produktów
      for (const item of productDetails) {
        const product = productsData.products.find((p) => p.id === item.id);
        if (!product) {
          throw createError({
            statusCode: 500,
            message: `Product not found: ${item.id}`,
          });
        }

        // Oblicz wartości bez żadnego zaokrąglania
        const unitPrice = product.price;
        subtotalAmount += unitPrice * item.qty;

        // Przekaż surowe wartości do order-confirmation
        emailProducts.push({
          name: product.name,
          quantity: item.qty,
          unitPrice: unitPrice, // cena bez rabatu
          totalPrice: unitPrice * item.qty, // cena * ilość bez rabatu
        });
      }

      // Obliczanie rabatu i kwot - dokładnie jak w cart-notification.post.ts
      // Oblicz rabat po wyliczeniu sumy (ważne dla spójności)
      const discountAmount = subtotalAmount * (totalDiscount / 100);
      // Zaokrąglij finalAmount tak samo jak w create-session.post.ts
      const finalAmount =
        Math.round((subtotalAmount - discountAmount) * 100) / 100;

      console.log("💰 [Webhook] Order totals:", {
        subtotalAmount: subtotalAmount,
        discountAmount: discountAmount,
        finalAmount: finalAmount,
        totalDiscount: totalDiscount,
        calculationCheck: {
          discount: (subtotalAmount * (totalDiscount / 100)).toFixed(2),
          final: (subtotalAmount - discountAmount).toFixed(2),
          finalRounded:
            Math.round((subtotalAmount - discountAmount) * 100) / 100,
          originalMetadata: {
            subtotal: session.metadata?.subtotalAmount,
            discount: session.metadata?.discountAmount,
            total: session.metadata?.totalAmount,
          },
        },
      });

      // Send confirmation email
      const emailResponse = await $fetch("/api/mail/order-confirmation", {
        method: "POST",
        body: {
          customerEmail: session.metadata?.customerEmail,
          orderDetails: {
            orderNumber: session.metadata?.orderNumber,
            customerName: session.metadata?.customerName,
            customerEmail: session.metadata?.customerEmail,
            customerPhone: session.metadata?.customerPhone,
            shippingAddress: {
              street: session.metadata?.shippingStreet,
              houseNumber: session.metadata?.shippingHouseNumber,
              postalCode: session.metadata?.shippingPostalCode,
              city: session.metadata?.shippingCity,
              country: session.metadata?.shippingCountry,
            },
            subtotalAmount,
            discountAmount,
            amount: finalAmount,
            items: emailProducts,
            cartDiscount,
            codeDiscount,
            discountCode: session.metadata?.discountCode || "",
            totalDiscount,
          },
        },
      });

      if (!emailResponse.success) {
        throw new Error("Failed to send order confirmation email");
      }

      // Zawsze oznacz sesję jako obsłużoną, niezależnie od źródła webhooka
      await stripe.checkout.sessions.update(session.id, {
        metadata: { ...session.metadata, emailSent: "true" },
      });
      console.log(
        `✅ [Webhook] Session marked as processed (source: ${
          isStripeCLI ? "CLI" : "production"
        })`
      );

      return {
        success: true,
        status: "processed",
        source: isStripeCLI ? "cli" : "production",
      };
    } catch (error) {
      console.error("❌ [Webhook] Order processing failed:", error);
      throw createError({
        statusCode: 500,
        message:
          error instanceof Error ? error.message : "Order processing failed",
      });
    }
  }

  // For other events just acknowledge receipt
  return {
    received: true,
    type: stripeEvent.type,
    status: "unhandled",
    source: isStripeCLI ? "cli" : "production",
  };
});
