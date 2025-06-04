import { defineEventHandler, readBody, readRawBody, getHeader } from "h3";
import Stripe from "stripe";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: "2023-10-16",
  });

  console.log("🔔 [Webhook] Endpoint hit");

  const signature = getHeader(event, "stripe-signature");
  const rawBody = await readRawBody(event);

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
    console.log("✅ [Webhook] Event verified successfully:", stripeEvent.type);
  } catch (err) {
    console.error("❌ [Webhook] Signature verification failed:", err);
    throw createError({
      statusCode: 400,
      message: "Webhook signature verification failed",
    });
  }

  const session = stripeEvent.data.object;

  // Reagujemy tylko na zdarzenie checkout.session.completed
  if (stripeEvent.type === "checkout.session.completed") {
    // Sprawdzamy czy płatność została zakończona pomyślnie
    if (session.payment_status !== "paid") {
      console.log("⚠️ [Webhook] Payment not completed yet");
      return {
        received: true,
        type: stripeEvent.type,
        message: "Payment not completed yet",
        status: "pending",
      };
    }

    console.log("💰 [Webhook] Processing completed checkout session:", {
      sessionId: session.id,
      orderNumber: session.metadata?.orderNumber,
      customerEmail: session.metadata?.customerEmail,
      customerName: session.metadata?.customerName,
      amount: session.amount_total,
    });

    // Sprawdź czy mail już został wysłany
    if (session.metadata?.emailSent === "true") {
      console.log(
        "📧 [Webhook] Confirmation email already sent for this session"
      );
      return {
        success: true,
        orderNumber: session.metadata?.orderNumber,
        message: "Email already sent",
        status: "success",
      };
    }

    try {
      // Pobierz pełne dane sesji wraz z line_items
      const expandedSession = await stripe.checkout.sessions.retrieve(
        session.id,
        {
          expand: ["line_items"],
        }
      );

      console.log("📦 [Webhook] Retrieved expanded session with line items");

      const products =
        expandedSession.line_items?.data.map((item) => ({
          name: item.description,
          quantity: item.quantity,
          price: (item.amount_total / 100).toFixed(2),
        })) || [];

      console.log("📧 [Webhook] Preparing to send confirmation emails");

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
            amount: (session.amount_total / 100).toFixed(2),
            items: products,
          },
        },
      });

      if (!emailResponse.success) {
        throw new Error("Failed to send confirmation emails");
      }

      // Oznacz sesję jako obsłużoną (mail wysłany)
      await stripe.checkout.sessions.update(session.id, {
        metadata: {
          ...session.metadata,
          emailSent: "true",
        },
      });

      console.log("✅ [Webhook] Confirmation emails sent successfully");

      return {
        success: true,
        orderNumber: session.metadata?.orderNumber,
        message: "Payment processed successfully",
        status: "success",
      };
    } catch (error) {
      console.error(
        "❌ [Webhook] Error processing checkout completion:",
        error
      );
      throw createError({
        statusCode: 500,
        message: "Error processing checkout completion",
      });
    }
  }

  return {
    received: true,
    type: stripeEvent.type,
    message: "Webhook received",
    status: "unhandled",
  };
});
