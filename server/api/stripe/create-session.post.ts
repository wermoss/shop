import Stripe from "stripe";
import { CartItem } from "~/types/shop";
import productsData from "../../../data/products.json";
import { generateOrderNumber } from "~/utils/orderNumber";
import { CART_DISCOUNT_TIERS } from "~/stores/shop/cart";

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

    // Oblicz całkowitą liczbę produktów w koszyku
    const totalQuantity = cartItems.reduce(
      (total, item) => total + item.quantity,
      0
    );

    // Oblicz rabat dla całego koszyka na podstawie łącznej liczby produktów
    const discountTier = [...CART_DISCOUNT_TIERS]
      .sort((a, b) => b.quantity - a.quantity)
      .find((tier) => totalQuantity >= tier.quantity);

    const cartDiscount = discountTier?.discount || 0;

    // Przygotuj listę produktów dla Stripe z uwzględnieniem globalnego rabatu
    const lineItems = cartItems.map((item: CartItem) => {
      const product = productsData.products.find((p) => p.id === item.id);
      if (!product) throw new Error("Product not found");

      // Zastosuj rabat dla całego koszyka do każdego produktu
      const finalPrice = product.price * (1 - cartDiscount / 100);

      return {
        price_data: {
          currency: "pln",
          product_data: {
            name: product.name,
            images: [`${baseUrl}${product.image}`],
            metadata: {
              productId: product.id,
            },
            description:
              cartDiscount > 0 ? `Cena z rabatem -${cartDiscount}%` : undefined,
          },
          unit_amount: Math.round(finalPrice * 100),
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
      cancel_url: `${baseUrl}/shop/cart`,
      customer_email: customer?.email,
      metadata: {
        orderNumber,
        customerName: customer?.name,
        customerEmail: customer?.email,
        customerPhone: customer?.phone,
        shippingStreet: customer?.address?.street,
        shippingHouseNumber: customer?.address?.houseNumber,
        shippingPostalCode: customer?.address?.postalCode,
        shippingCity: customer?.address?.city,
        shippingCountry: customer?.address?.country,
        cartDiscount: cartDiscount.toString(), // Dodaj informację o rabacie w metadanych
        totalQuantity: totalQuantity.toString(), // Dodaj informację o łącznej liczbie produktów
      },
    };

    // Dodaj dane klienta tylko jeśli są dostępne
    if (customer?.email) {
      sessionConfig.customer_email = customer.email;
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
