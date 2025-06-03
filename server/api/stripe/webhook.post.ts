import Stripe from "stripe";
import { createError, H3Event } from "h3";

export default defineEventHandler(async (event: H3Event) => {
  const config = useRuntimeConfig();
  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: "2023-10-16",
  });

  console.log("Webhook endpoint hit");

  const signature = getHeader(event, "stripe-signature");
  const body = await readRawBody(event);

  if (!signature || !body) {
    console.error("No signature or body found");
    throw createError({
      statusCode: 400,
      message: "Missing signature or body",
    });
  }

  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      body,
      signature,
      config.stripeWebhookSecret
    );
    console.log("Webhook verified successfully:", stripeEvent.type);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    throw createError({
      statusCode: 400,
      message: "Webhook signature verification failed",
    });
  }

  // Handle the checkout.session.completed event
  if (stripeEvent.type === "checkout.session.completed") {
    const session = stripeEvent.data.object;
    const orderNumber = session.metadata?.orderNumber;

    console.log("Processing checkout.session.completed");
    console.log("Order number:", orderNumber);
    console.log("Payment status:", session.payment_status);

    if (session.payment_status === "paid") {
      console.log(`Payment successful for order ${orderNumber}`);

      // Wyodrębnij metadane do przekazania na stronę success
      const metadata = {
        customerName: session.metadata?.customerName,
        customerEmail: session.metadata?.customerEmail,
        customerPhone: session.metadata?.customerPhone,
        shippingAddress: session.metadata?.shippingAddress,
        shippingCity: session.metadata?.shippingCity,
        shippingPostalCode: session.metadata?.shippingPostalCode,
        shippingCountry: session.metadata?.shippingCountry,
      };

      return {
        success: true,
        orderNumber,
        metadata,
        message: "Payment processed successfully",
      };
    }
  }

  return {
    received: true,
    type: stripeEvent.type,
    message: "Webhook received and processed",
  };
});
