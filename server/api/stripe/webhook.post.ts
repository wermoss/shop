import Stripe from "stripe";
import { createError, H3Event } from "h3";
import productsData from "../../../data/products.json";
import { writeFile } from "fs/promises";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineEventHandler(async (event: H3Event) => {
  const config = useRuntimeConfig();
  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: "2023-10-16",
  });

  console.log("Webhook received");

  const signature = getHeader(event, "stripe-signature");
  const body = await readRawBody(event);

  if (!signature || !body) {
    console.error("Missing signature or body");
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
    console.log("Webhook event constructed successfully:", stripeEvent.type);
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

      // Zwracamy sukces bez aktualizacji pliku
      return {
        success: true,
        orderNumber,
        message: "Payment processed successfully",
      };
    }
  }

  // Dla innych typów eventów
  console.log("Webhook processed successfully");
  return {
    received: true,
    type: stripeEvent.type,
    message: "Webhook received and processed",
  };
});
