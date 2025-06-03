import Stripe from "stripe";
import { CartItem } from "~/types/shop";
import productsData from "../../../data/products.json";
import { generateOrderNumber } from "~/utils/orderNumber";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: "2023-10-16",
  });

  try {
    const body = await readBody(event);
    const { items: cartItems, customer } = body;

    // Poprawne tworzenie URL-i z host i protokołem
    const headers = event.node.req.headers;
    const protocol = headers["x-forwarded-proto"] || "http";
    const host = headers["x-forwarded-host"] || headers.host;
    const baseUrl = `${protocol}://${host}`;

    // Generuj numer zamówienia
    const orderNumber = generateOrderNumber();

    // Przygotuj listę produktów dla Stripe
    const lineItems = cartItems.map((item: CartItem) => {
      const product = productsData.products.find((p) => p.id === item.id);
      if (!product) throw new Error("Product not found");

      return {
        price_data: {
          currency: "pln",
          product_data: {
            name: product.name,
            images: [`${baseUrl}${product.image}`],
            metadata: {
              productId: product.id,
            },
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: item.quantity,
      };
    });

    // Podstawowa konfiguracja sesji
    const sessionConfig = {
      payment_method_types: ["card", "p24"],
      payment_method_options: {
        p24: {
          tos_shown_and_accepted: true,
        },
      },
      locale: "pl",
      line_items: lineItems,
      mode: "payment",
      success_url: `${baseUrl}/shop/success?order=${orderNumber}`,
      cancel_url: `${baseUrl}/shop/failed?order=${orderNumber}`,
      billing_address_collection: "auto",
      metadata: {
        orderNumber,
      },
    };

    // Dodaj dane klienta tylko jeśli są dostępne
    if (customer?.email) {
      sessionConfig.customer_email = customer.email;
    }

    // Dodaj metadane tylko jeśli wszystkie wymagane pola są dostępne
    if (customer?.address) {
      const metadata = sessionConfig.metadata || {};

      if (customer.name) metadata.customerName = customer.name;
      if (customer.email) metadata.customerEmail = customer.email;
      if (customer.phone) metadata.customerPhone = customer.phone;

      const { street, houseNumber, city, postalCode, country } =
        customer.address;
      if (street && houseNumber) {
        metadata.shippingAddress = `${street} ${houseNumber}`;
      }
      if (city) metadata.shippingCity = city;
      if (postalCode) metadata.shippingPostalCode = postalCode;
      if (country) metadata.shippingCountry = country;

      sessionConfig.metadata = metadata;
    }

    // Utwórz sesję płatności
    const session = await stripe.checkout.sessions.create(sessionConfig);

    return { sessionId: session.id, orderNumber };
  } catch (error) {
    console.error("Stripe session creation error:", error);
    throw createError({
      statusCode: 400,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create payment session",
    });
  }
});
