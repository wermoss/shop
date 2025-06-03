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

  const session = stripeEvent.data.object;
  const orderNumber = session.metadata?.orderNumber;

  console.log("Processing webhook event:", stripeEvent.type);
  console.log("Order number:", orderNumber);
  console.log("Payment status:", session.payment_status);
  console.log("Payment intent:", session.payment_intent);

  switch (stripeEvent.type) {
    case "checkout.session.completed":
      if (session.payment_status === "paid") {
        console.log(`Payment successful for order ${orderNumber}`);
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
      break;

    case "payment_intent.payment_failed":
      console.log(`Payment intent failed for order ${orderNumber}`);
      const error = session.last_payment_error;
      return {
        success: false,
        orderNumber,
        message: error?.message || "Payment failed",
        redirectUrl: `/shop/failed?order=${orderNumber}`,
      };

    case "checkout.session.async_payment_failed":
      console.log(`Payment failed for order ${orderNumber}`);
      return {
        success: false,
        orderNumber,
        message: "Payment failed",
        redirectUrl: `/shop/failed?order=${orderNumber}`,
      };

    case "checkout.session.expired":
      console.log(`Session expired for order ${orderNumber}`);
      return {
        success: false,
        orderNumber,
        message: "Payment session expired",
        redirectUrl: `/shop/failed?order=${orderNumber}`,
      };
  }

  return {
    received: true,
    type: stripeEvent.type,
    message: "Webhook received and processed",
  };
});
