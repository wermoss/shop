import Stripe from "stripe";
import { CartItem } from "~/types/shop";
import productsData from "../../../data/products.json";
import { generateOrderNumber } from "~/utils/orderNumber";
// Import discount tiers and codes directly from the JSON file since we can't use the store on the server
import discountsData from "../../../data/discounts.json";

const CART_DISCOUNT_TIERS = discountsData.cartDiscountTiers;
const DISCOUNT_CODES = discountsData.discountCodes;

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: "2023-10-16",
  });

  try {
    const body = await readBody(event);
    const { items: cartItems, customer, appliedDiscountCode } = body;

    // Poprawne tworzenie URL-i z host i protokołem
    const headers = event.node.req.headers;
    const protocol = headers["x-forwarded-proto"] || "http";
    const host = headers["x-forwarded-host"] || headers.host;
    const baseUrl = `${protocol}://${host}`;

    // Generuj numer zamówienia
    const orderNumber = generateOrderNumber();

    // Oblicz całkowitą liczbę produktów w koszyku
    const totalQuantity = cartItems.reduce(
      (total: number, item: CartItem) => total + item.quantity,
      0
    );

    // Oblicz rabat dla całego koszyka na podstawie łącznej liczby produktów
    const discountTier = [...CART_DISCOUNT_TIERS]
      .sort((a, b) => b.quantity - a.quantity)
      .find((tier) => totalQuantity >= tier.quantity);

    const cartDiscount = discountTier?.discount || 0;

    // Oblicz rabat z kodu rabatowego (jeśli został zastosowany)
    let codeDiscount = 0;
    let discountCodeInfo = null;

    if (appliedDiscountCode) {
      discountCodeInfo = DISCOUNT_CODES.find(
        (code: any) =>
          code.code.toUpperCase() === appliedDiscountCode.toUpperCase()
      );

      if (discountCodeInfo) {
        codeDiscount = discountCodeInfo.discount;
      }
    }

    // Oblicz łączny rabat (suma rabatu ilościowego i kodowego)
    const totalDiscount = cartDiscount + codeDiscount;

    // Oblicz łączną wartość zamówienia z uwzględnieniem rabatu
    let subtotalAmount = 0;
    const items = cartItems.map((item: CartItem) => {
      const product = productsData.products.find((p) => p.id === item.id);
      if (!product) throw new Error("Product not found");

      // Najpierw sumujemy cenę bez rabatu
      const itemSubtotal = product.price * item.quantity;
      subtotalAmount += itemSubtotal;

      return {
        id: item.id,
        qty: item.quantity,
      };
    });

    // Obliczamy rabat od całej kwoty
    const discountAmount = subtotalAmount * (totalDiscount / 100);
    const finalAmount = subtotalAmount - discountAmount;

    console.log("💰 [Create Session] Cart values:", {
      subtotalAmount,
      discountAmount,
      finalAmount,
      totalDiscount,
    });

    // Przygotuj pojedynczy wiersz z łączną kwotą zamówienia
    const lineItems = [
      {
        price_data: {
          currency: "pln",
          product_data: {
            name: "Zamówienie w NuxtShop",
            description:
              totalDiscount > 0
                ? `Zawiera rabat ilościowy ${cartDiscount}%${
                    discountCodeInfo
                      ? ` oraz rabat z kodu ${discountCodeInfo.code} (${codeDiscount}%)`
                      : ""
                  }`
                : undefined,
            metadata: {
              orderNumber: orderNumber,
            },
          },
          // Przekształcamy kwotę na grosze
          unit_amount: Math.round(finalAmount * 100),
        },
        quantity: 1,
      },
    ];

    // Zapisz informacje o produktach w metadanych
    const metadata = {
      orderNumber,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      shippingStreet: customer.address.street,
      shippingHouseNumber: customer.address.houseNumber,
      shippingPostalCode: customer.address.postalCode,
      shippingCity: customer.address.city,
      shippingCountry: customer.address.country,
      cartDiscount: cartDiscount.toString(),
      codeDiscount: codeDiscount.toString(),
      totalDiscount: totalDiscount.toString(),
      discountCode: appliedDiscountCode || "",
      productIds: JSON.stringify(items),
      subtotalAmount: subtotalAmount.toString(),
      discountAmount: discountAmount.toString(),
      totalAmount: finalAmount.toString(),
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
      success_url: `${baseUrl}/shop/success?order=${orderNumber}`,
      cancel_url: `${baseUrl}/shop/cart`,
      customer_email: customer?.email,
      // Zapisujemy dane o produktach w metadanych
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
        cartDiscount: cartDiscount.toString(),
        codeDiscount: codeDiscount.toString(),
        totalDiscount: totalDiscount.toString(),
        discountCode: discountCodeInfo?.code || "",
        totalQuantity: totalQuantity.toString(),
        totalAmount: finalAmount.toFixed(2),
        productIds: JSON.stringify(
          cartItems.map((item: CartItem) => ({
            id: item.id,
            qty: item.quantity,
          }))
        ),
      },
      // Ukrywamy szczegóły produktów, pokazujemy tylko łączną kwotę
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
