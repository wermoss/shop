import { defineEventHandler, readBody, readRawBody, getHeader } from "h3";
import Stripe from "stripe";
import type { Product } from "~/types/shop";

interface ProductDetail {
  id: number;
  name: string;
  price: number;
  quantity: number;
  lineItemTotalPrice: number;
  discountAppliedToLineItem: number;
  lineItemTotalPriceWithDiscount: number;
  image?: string;
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
      // W metadanych sesji Stripe powinny znajdować się wszystkie potrzebne informacje
      // o produktach i rabatach, obliczone przez calculateOrderTotals

      if (!session.metadata?.products) {
        throw createError({
          statusCode: 400,
          message: "No product information in session metadata",
        });
      }

      // Odczytujemy dane produktów
      const productsWithDetails: ProductDetail[] = JSON.parse(
        session.metadata.products
      );

      // Odczytujemy wartości rabatów
      const subtotalAmount = parseFloat(
        session.metadata?.subtotalAmount || "0"
      );
      const cartDiscountPercent = parseFloat(
        session.metadata?.cartDiscountPercent || "0"
      );
      const cartDiscountAmount = parseFloat(
        session.metadata?.cartDiscountAmount || "0"
      );
      const codeDiscountPercent = parseFloat(
        session.metadata?.codeDiscountPercent || "0"
      );
      const codeDiscountAmount = parseFloat(
        session.metadata?.codeDiscountAmount || "0"
      );
      const totalDiscountAmount = parseFloat(
        session.metadata?.totalDiscountAmount || "0"
      );
      const finalAmount = parseFloat(session.metadata?.finalAmount || "0");
      const appliedDiscountCode = session.metadata?.appliedDiscountCode || "";

      // Logowanie dla debugowania
      console.log("💰 [Webhook] Order details from session metadata:", {
        subtotalAmount,
        cartDiscountPercent,
        cartDiscountAmount,
        codeDiscountPercent,
        codeDiscountAmount,
        totalDiscountAmount,
        finalAmount,
        appliedDiscountCode,
        numberOfProducts: productsWithDetails.length,
      });

      // Przygotowujemy produkty do szablonu email
      const emailProducts = productsWithDetails.map((product) => ({
        name: product.name,
        quantity: product.quantity,
        price: product.price, // Oryginalna cena jednostkowa
        unitPrice: product.price, // Oryginalna cena jednostkowa
        totalPrice: product.lineItemTotalPrice, // Suma bez rabatu
        priceWithDiscount: product.lineItemTotalPriceWithDiscount, // Suma po rabacie
        discountAmount: product.discountAppliedToLineItem, // Kwota rabatu
        image: product.image,
      }));

      // Przygotowanie danych do wysłania emaila
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
        // Dane finansowe
        subtotalAmount,
        cartDiscountPercent,
        cartDiscountAmount,
        codeDiscountPercent,
        codeDiscountAmount,
        totalDiscountAmount,
        appliedDiscountCode,
        amount: finalAmount,
        // Produkty
        items: emailProducts,
      };

      console.log("📧 [Webhook] Sending order details to email service:", {
        customerEmail: session.metadata?.customerEmail,
        orderNumber: session.metadata?.orderNumber,
        subtotalAmount,
        discounts: {
          cartDiscountPercent,
          cartDiscountAmount,
          codeDiscountPercent,
          codeDiscountAmount,
          totalDiscountAmount,
        },
        finalAmount,
      });

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

      // Zawsze oznacz sesję jako obsłużoną
      await stripe.checkout.sessions.update(session.id, {
        metadata: { ...session.metadata, emailSent: "true" },
      });
      console.log(`✅ [Webhook] Session marked as processed`);

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
