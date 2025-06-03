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

  const signature = getHeader(event, "stripe-signature");
  const body = await readRawBody(event);

  if (!signature || !body) {
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
  } catch (err) {
    console.error("Webhook signature verification failed");
    throw createError({
      statusCode: 400,
      message: "Webhook signature verification failed",
    });
  }

  // Handle the checkout.session.completed event
  if (stripeEvent.type === "checkout.session.completed") {
    const session = stripeEvent.data.object;
    const orderNumber = session.metadata?.orderNumber;

    if (session.payment_status === "paid") {
      console.log(`Payment successful for order ${orderNumber}`);

      try {
        // Pobierz informacje o produktach z sesji
        const lineItems = await stripe.checkout.sessions.listLineItems(
          session.id
        );

        // Dla każdego produktu zaktualizuj stan magazynowy
        for (const item of lineItems.data) {
          const productId = item.price?.product_data?.metadata?.productId;
          if (productId) {
            const product = productsData.products.find(
              (p) => p.id === parseInt(productId)
            );
            if (product) {
              product.stock -= item.quantity;
              if (product.stock < 0) product.stock = 0;
            }
          }
        }

        try {
          // Aktualizuj plik products.json w bezpieczny sposób
          const filePath = resolve(__dirname, "../../../data/products.json");
          await writeFile(
            filePath,
            JSON.stringify(productsData, null, 2),
            { mode: 0o644 } // Ustaw odpowiednie uprawnienia
          );
          console.log("Successfully updated product stock");
        } catch (writeError) {
          console.error("Failed to update products.json:", writeError);
          // Nie rzucaj błędu - płatność została przyjęta, więc chcemy zwrócić sukces
          // Możemy tu dodać kod do powiadomienia administratora o problemie
        }

        return { success: true, orderNumber };
      } catch (error) {
        console.error("Error processing webhook:", error);
        // Nie rzucaj błędu HTTP 500, zwróć sukces ponieważ płatność została przyjęta
        return { success: true, orderNumber, stockUpdateError: true };
      }
    }
  }

  return {
    received: true,
  };
});
