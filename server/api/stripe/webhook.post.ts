import Stripe from "stripe";
import { createError, H3Event } from "h3";

export default defineEventHandler(async (event: H3Event) => {
  const config = useRuntimeConfig();
  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: "2023-10-16",
  });

  const signature = getHeader(event, "stripe-signature");
  const body = await readRawBody(event);

  if (!signature || !body) {
    throw createError({
      statusCode: 400,
      message: "Missing signature or body",
    });
  }

  try {
    const stripeEvent = stripe.webhooks.constructEvent(
      body,
      signature,
      config.stripeWebhookSecret
    );

    // Natychmiast zwróć sukces dla wszystkich eventów
    return {
      received: true,
      type: stripeEvent.type,
    };
  } catch (err) {
    throw createError({
      statusCode: 400,
      message: "Webhook signature verification failed",
    });
  }
});
