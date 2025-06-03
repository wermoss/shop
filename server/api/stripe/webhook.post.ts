import Stripe from "stripe";
import { createError, H3Event } from "h3";

export default defineEventHandler(async (event: H3Event) => {
  console.log("Webhook endpoint hit");

  const signature = getHeader(event, "stripe-signature");

  if (!signature) {
    console.log("No signature found");
    return { received: true };
  }

  const body = await readRawBody(event);

  if (!body) {
    console.log("No body found");
    return { received: true };
  }

  console.log("Webhook received with signature:", signature);

  return { received: true };
});
