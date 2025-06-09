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

      // Odczytujemy wartości z metadanych sesji
      let subtotalAmount = 0;
      const cartDiscount = parseInt(session.metadata?.cartDiscount || "0");
      const codeDiscount = parseInt(session.metadata?.codeDiscount || "0");
      const totalDiscount = cartDiscount + codeDiscount;

      // Odczytujemy kwoty rabatów, które zostały już obliczone w create-session.post.ts
      const cartDiscountAmount = parseFloat(
        session.metadata?.cartDiscountAmount || "0"
      );
      const codeDiscountAmount = parseFloat(
        session.metadata?.codeDiscountAmount || "0"
      );
      const totalDiscountAmount = parseFloat(
        session.metadata?.totalDiscountAmount || "0"
      );

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

      // Obliczamy rabaty dokładnie tak samo jak w create-session.post.ts
      // Wyliczamy rabaty od nowa, aby mieć pewność, że są zgodne z nową metodologią

      // 1. Rabat ilościowy zaokrąglony do pełnych złotych
      const recalculatedCartDiscountAmount =
        cartDiscount > 0
          ? Math.round(subtotalAmount * (cartDiscount / 100))
          : 0;

      // 2. Rabat z kuponu zaokrąglony do pełnych złotych
      const recalculatedCodeDiscountAmount =
        codeDiscount > 0
          ? Math.round(subtotalAmount * (codeDiscount / 100))
          : 0;

      // 3. Suma obu rabatów
      const recalculatedTotalDiscountAmount =
        recalculatedCartDiscountAmount + recalculatedCodeDiscountAmount;

      // 4. Finalna kwota po odjęciu rabatu
      const finalAmount = subtotalAmount - recalculatedTotalDiscountAmount;

      console.log("💰 [Webhook] Order totals:", {
        subtotalAmount: subtotalAmount,
        rabaty: {
          cartDiscountPercent: cartDiscount,
          cartDiscountAmount: recalculatedCartDiscountAmount,
          cartDiscountRaw: subtotalAmount * (cartDiscount / 100),
          cartDiscountRounded: Math.round(
            subtotalAmount * (cartDiscount / 100)
          ),

          codeDiscountPercent: codeDiscount,
          codeDiscountAmount: recalculatedCodeDiscountAmount,
          codeDiscountRaw: subtotalAmount * (codeDiscount / 100),
          codeDiscountRounded: Math.round(
            subtotalAmount * (codeDiscount / 100)
          ),

          totalDiscountPercent: totalDiscount,
          totalDiscountAmount: recalculatedTotalDiscountAmount,
        },
        finalAmount: finalAmount,
        productTotal: subtotalAmount,
        finalCheck: subtotalAmount - recalculatedTotalDiscountAmount,
        originalMetadata: {
          subtotal: session.metadata?.subtotalAmount,
          cartDiscountAmount: session.metadata?.cartDiscountAmount,
          codeDiscountAmount: session.metadata?.codeDiscountAmount,
          totalDiscountAmount: session.metadata?.totalDiscountAmount,
          finalAmount: session.metadata?.finalAmount,
        },
      });

      const orderDetailsForEmail = {
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
        cartDiscountAmount: recalculatedCartDiscountAmount,
        codeDiscountAmount: recalculatedCodeDiscountAmount,
        totalDiscountAmount: recalculatedTotalDiscountAmount,
        amount: finalAmount,
        items: emailProducts,
        cartDiscount,
        codeDiscount,
        discountCode: session.metadata?.discountCode || "",
        totalDiscount,
      };

      // Log discount values before sending to email
      console.log("💯 [Webhook] Sending discount values to email (OLD LOG):", {
        recalculatedValues: {
          cartDiscountAmount: recalculatedCartDiscountAmount,
          codeDiscountAmount: recalculatedCodeDiscountAmount,
          totalDiscountAmount: recalculatedTotalDiscountAmount,
          finalAmount,
        },
        forcedValues: {
          // We want the discounts to always add up to 160 PLN
          forcedTotalDiscount: 160,
          forcedPartialDiscount: 80,
        },
      });

      console.log(
        "📧 [Webhook] EXACT orderDetails BEING SENT to email service:",
        orderDetailsForEmail
      );

      const emailResponse = await $fetch("/api/mail/order-confirmation", {
        method: "POST",
        body: {
          customerEmail: session.metadata?.customerEmail,
          orderDetails: orderDetailsForEmail,
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
