import Stripe from "stripe";
import { CartItem, Product } from "~/types/shop";
import productsData from "../../../data/products.json";
import discountsData from "../../../data/discounts.json";
import { generateOrderNumber } from "~/utils/orderNumber";
import { calculateOrderTotals } from "../../utils/calculateOrderTotals";
import { $fetch } from "ofetch";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

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

    // Import crypto dla tworzenia podpisu
    const crypto = await import("crypto");

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

    // Przygotuj dane produktów dla metadanych - ograniczamy dane do minimum, aby zmieścić się w limicie metadanych Stripe (500 znaków)
    const productsWithDetails = orderDetails.productsWithCalculatedPrices.map(
      (p) => ({
        id: p.id,
        n: p.name.substring(0, 20), // Skrócona nazwa
        p: p.price,
        q: p.quantity,
        d: p.discountAppliedToLineItem,
        f: p.lineItemTotalPriceWithDiscount,
      })
    );

    // Sprawdzamy czy kod rabatowy jest kodem influencera
    let influencerEmail = null;

    if (appliedDiscountCode) {
      // Próbujemy znaleźć kod w tablicy kodów influencerów
      const influencerCode = discountsData.influencerCodes?.find(
        (code: { code: string; email: string; discount: number }) =>
          code.code.toUpperCase() === appliedDiscountCode.toUpperCase()
      );

      if (influencerCode && influencerCode.email) {
        influencerEmail = influencerCode.email;
        console.log(
          `📧 [Create Session] Found influencer code with email: ${influencerEmail}`
        );
      }
    }

    // Zapisz wszystkie informacje potrzebne do emaila potwierdzenia zamówienia
    const metadata = {
      orderNumber,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone || "",

      // Dane adresowe
      shippingStreet: customer.address?.street || "",
      shippingHouseNumber: customer.address?.houseNumber || "",
      shippingPostalCode: customer.address?.postalCode || "",
      shippingCity: customer.address?.city || "",
      shippingCountry: customer.address?.country || "",

      // Dane finansowe
      subtotalAmount: orderDetails.subtotalAmount.toString(),
      cartDiscountPercent: orderDetails.cartDiscountPercent.toString(),
      cartDiscountAmount: orderDetails.cartDiscountAmount.toString(),
      codeDiscountPercent: orderDetails.codeDiscountPercent.toString(),
      codeDiscountAmount: orderDetails.codeDiscountAmount.toString(),
      totalDiscountAmount: orderDetails.totalDiscountAmount.toString(),
      appliedDiscountCode: orderDetails.appliedDiscountCode || "",
      influencerEmail: influencerEmail || "", // Dodajemy email influencera jeśli jest dostępny
      finalAmount: orderDetails.finalAmount.toString(),

      // Dane produktów - zapisujemy jako JSON string
      products: JSON.stringify(productsWithDetails),

      // Flaga określająca czy email został już wysłany (używana przez webhook)
      emailSent: "false",
    };

    // Tworzenie podpisu dla URL
    const signatureData = `${orderNumber}:${orderTimestamp}`;
    const signature = crypto.default
      .createHmac("sha256", config.orderSignatureSecret)
      .update(signatureData)
      .digest("hex");

    // Tworzenie URL sukcesu z poprawnym rozdzieleniem parametrów
    const successUrl = new URL(`${baseUrl}/shop/success`);
    successUrl.searchParams.append("order", orderNumber);
    successUrl.searchParams.append("timestamp", orderTimestamp);
    successUrl.searchParams.append("signature", signature);

    // Logowanie dla celów debugowania
    console.log("Wygenerowany URL sukcesu:", successUrl.toString());
    console.log("Parametry podpisu:", {
      orderNumber,
      orderTimestamp,
      signature,
    });

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
      success_url: successUrl.toString(),
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

    // Influencer email będzie wysłany przez webhook po zakończeniu płatności
    if (influencerEmail) {
      console.log(
        `📧 [Create Session] Influencer email (${influencerEmail}) zapisany w metadanych. Email zostanie wysłany po zakończeniu płatności.`
      );
    }

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
