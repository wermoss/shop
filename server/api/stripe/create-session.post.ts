import Stripe from "stripe";
import { CartItem, Product } from "~/types/shop";
import productsData from "../../../data/products.json";
import { generateOrderNumber } from "~/utils/orderNumber";
import { calculateOrderTotals } from "../../utils/calculateOrderTotals";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: "2025-05-28.basil", // Zaktualizowano do tej samej wersji co w webhook.post.ts
  });

  try {
    const body = await readBody(event);
    const { items: cartItems, customer, appliedDiscountCode } = body;

    // Poprawne tworzenie URL-i z host i protokołem
    const headers = event.node.req.headers;
    const protocol = headers["x-forwarded-proto"] || "http";
    const host = headers["x-forwarded-host"] || headers.host;
    const baseUrl = `${protocol}://${host}`;

    // Generuj numer zamówienia i timestamp
    const orderNumber = generateOrderNumber();
    const orderTimestamp = Date.now().toString();

    // Przygotowanie danych produktów dla calculateOrderTotals
    const cartItemsForCalc = cartItems.map((item: CartItem) => {
      const product = productsData.products.find((p) => p.id === item.id);
      if (!product)
        throw new Error(`Produkt o ID ${item.id} nie został znaleziony`);

      return {
        id: item.id,
        quantity: item.quantity,
        product: product,
      };
    });

    // Użycie zunifikowanej funkcji do obliczenia rabatów i sum
    const orderDetails = calculateOrderTotals(
      cartItemsForCalc,
      appliedDiscountCode
    );

    console.log("💰 [Create Session] Calculated order details:", {
      subtotalAmount: orderDetails.subtotalAmount,
      cartDiscountPercent: orderDetails.cartDiscountPercent,
      cartDiscountAmount: orderDetails.cartDiscountAmount,
      codeDiscountPercent: orderDetails.codeDiscountPercent,
      codeDiscountAmount: orderDetails.codeDiscountAmount,
      totalDiscountAmount: orderDetails.totalDiscountAmount,
      finalAmount: orderDetails.finalAmount,
    });

    // Przygotuj pojedynczy wiersz z łączną kwotą zamówienia
    const lineItems = [
      {
        price_data: {
          currency: "pln",
          product_data: {
            name: "Zamówienie w NuxtShop",
            description:
              orderDetails.totalDiscountAmount > 0
                ? `Zawiera rabat ${
                    orderDetails.cartDiscountPercent >=
                    orderDetails.codeDiscountPercent
                      ? `ilościowy ${orderDetails.cartDiscountPercent}%`
                      : `dodatkowy z kodu ${orderDetails.appliedDiscountCode} (${orderDetails.codeDiscountPercent}%)`
                  }`
                : undefined,
            metadata: {
              orderNumber: orderNumber,
            },
          },
          // Przekształcamy kwotę na grosze
          unit_amount: Math.round(orderDetails.finalAmount * 100),
        },
        quantity: 1,
      },
    ];

    // Przygotuj skrócone dane produktów dla metadanych - zredukowane do minimum, aby zmieścić się w limicie 500 znaków
    const productsWithDetails = orderDetails.productsWithCalculatedPrices.map(
      (p) => ({
        id: p.id,
        qty: p.quantity,
        // Eliminujemy większość pól, aby zmieścić się w limicie metadanych Stripe (500 znaków)
      })
    );

    // Zapisz tylko najważniejsze informacje w metadanych (limit 500 znaków)
    const metadata = {
      orderNumber,
      customerEmail: customer.email,

      // Minimalna ilość danych o zamówieniu
      total: orderDetails.finalAmount.toString(),
      discount: orderDetails.totalDiscountAmount.toString(),
      items: JSON.stringify(productsWithDetails),
    };

    // Podstawowa konfiguracja sesji
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card", "p24"],
      payment_method_options: {
        p24: {
          tos_shown_and_accepted: true,
        },
      },
      locale: "pl",
      line_items: lineItems,
      mode: "payment",
      success_url: `${baseUrl}/shop/success?order=${orderNumber}&timestamp=${orderTimestamp}`,
      cancel_url: `${baseUrl}/shop/cart`,
      customer_email: customer?.email,
      metadata: metadata,
      billing_address_collection: "auto",
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
