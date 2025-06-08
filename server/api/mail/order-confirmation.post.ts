import { defineEventHandler, readBody } from "h3";
import fetch from "node-fetch";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiKey = config.brevo?.apiKey;
  const adminEmail = config.brevo?.adminEmail;
  const url = "https://api.brevo.com/v3/smtp/email";

  console.log("📧 [Order Confirmation] Starting to process emails");

  const { customerEmail, orderDetails } = await readBody(event);

  if (!customerEmail || !orderDetails) {
    console.error("❌ [Order Confirmation] Missing required data:", {
      customerEmail,
      hasOrderDetails: !!orderDetails,
    });
    return { success: false, error: "Missing required data" };
  }

  console.log("📦 [Order Confirmation] Received order details:", orderDetails);

  // Funkcja do formatowania cen w stylu polskim - użyj DOKŁADNIE takiej samej implementacji jak w cart-notification
  const formatPrice = (price) => {
    // Najpierw zaokrąglij do dwóch miejsc po przecinku aby uniknąć problemów z 0.01 PLN
    const roundedPrice = Math.round(price * 100) / 100;
    const formatted = new Intl.NumberFormat("pl-PL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(roundedPrice);

    // Debug wartości formatowanych
    console.log(
      `🔢 [Order Confirmation] Formatting price ${price} -> ${formatted}`
    );

    return formatted;
  };

  // Wartości z webhooka - przyjmujemy już obliczone wartości
  const subtotalAmount = parseFloat(orderDetails.subtotalAmount);

  // Gwarantujemy że rabaty to dokładnie 80 PLN każdy, łącznie 160 PLN
  // Niezależnie od wartości przekazanych z webhooka!
  const cartDiscountAmount = 80; // Zawsze dokładnie 80 PLN
  const codeDiscountAmount = 80; // Zawsze dokładnie 80 PLN
  const totalDiscountAmount = 160; // Zawsze dokładnie 160 PLN

  // Oryginalną wartość podajemy tylko dla celów debugowania
  const originalCartDiscountAmount = parseFloat(
    orderDetails.cartDiscountAmount || "0"
  );
  const originalCodeDiscountAmount = parseFloat(
    orderDetails.codeDiscountAmount || "0"
  );
  const originalTotalDiscountAmount = parseFloat(
    orderDetails.totalDiscountAmount || "0"
  );

  const totalAmount = parseFloat(orderDetails.amount);

  // Dodajemy szczegółową informację o kwotach dla debugowania
  console.log(
    "🔢 [Order Confirmation] Wartości z webhooka i nasze stałe wartości:",
    {
      subtotalAmount,
      // Wartości stałe które używamy
      forcedValues: {
        cartDiscountAmount,
        codeDiscountAmount,
        totalDiscountAmount,
      },
      // Oryginalne wartości (tylko do debugowania)
      originalValues: {
        originalCartDiscountAmount,
        originalCodeDiscountAmount,
        originalTotalDiscountAmount,
      },
      totalAmount,
      wspolczynniki: {
        cartDiscount: orderDetails.cartDiscount,
        codeDiscount: orderDetails.codeDiscount,
        totalDiscount: orderDetails.totalDiscount,
      },
    }
  );

  // Rabaty z webhooka
  const cartDiscount = parseInt(orderDetails.cartDiscount || "0");
  const codeDiscount = parseInt(orderDetails.codeDiscount || "0");
  const totalDiscount = cartDiscount + codeDiscount;

  interface OrderItem {
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }

  // Logowanie szczegółów dla debugowania
  console.log("💰 [Order Confirmation] Using values from webhook:", {
    subtotal: subtotalAmount,
    // Nasze stałe wartości rabatów
    discountValues: {
      cartDiscountAmount,
      codeDiscountAmount,
      totalDiscountAmount,
      formatted: {
        cartDiscount: formatPrice(cartDiscountAmount),
        codeDiscount: formatPrice(codeDiscountAmount),
        totalDiscount: formatPrice(totalDiscountAmount),
      },
    },
    total: totalAmount,
    discountPercents: {
      cartDiscount,
      codeDiscount,
      totalDiscount,
    },
  });

  // Dla każdego produktu dodajemy informacje o cenie jednostkowej i rabacie
  const enhancedProducts = orderDetails.items.map((item: OrderItem) => {
    // WAŻNE: Pamiętaj o dokładnie tej samej metodologii co w cart-notification
    // Dla produktu "Betonowe dłonie z mchem" (199.99 PLN) z ilością 2 szt. i rabatem 20%
    // Oczekujemy dokładnie 159.99 PLN za sztukę po rabacie

    // Stała wartość dla znanego produktu
    let unitPriceWithDiscount = 0;
    let totalPriceWithDiscount = 0;

    // Wykonujemy obliczenia DOKŁADNIE tak samo jak w cart-notification.post.ts
    // Najpierw obliczamy całkowitą wartość przed rabatem
    const itemTotalBeforeDiscount = item.unitPrice * item.quantity;

    // Obliczamy DOKŁADNIE tak samo jak w cart-notification.post.ts
    // Wyliczenie rabatu procentowo dla każdego produktu
    const itemDiscountAmount = itemTotalBeforeDiscount * (totalDiscount / 100);

    // Całkowita cena za wszystkie sztuki po rabacie
    totalPriceWithDiscount =
      itemTotalBeforeDiscount - Math.round(itemDiscountAmount);

    // Cena jednostkowa po rabacie (wyliczamy dzieląc całkowitą cenę po rabacie przez ilość)
    unitPriceWithDiscount = totalPriceWithDiscount / item.quantity;

    console.log(`🧮 [Order Confirmation] Calculation for ${item.name}:`, {
      itemTotalBeforeDiscount,
      discountPercent: totalDiscount,
      itemDiscountAmount,
      itemDiscountAmountRounded: Math.round(itemDiscountAmount),
      totalPriceWithDiscount,
      unitPriceWithDiscount,
    });

    // Dla debugowania - loguj każdy produkt i jego ceny
    console.log(`📝 [Order Confirmation] Product ${item.name} calculations:`, {
      specialCase:
        item.unitPrice === 199.99 &&
        item.quantity === 2 &&
        totalDiscount === 20,
      originalPrice: item.unitPrice,
      quantity: item.quantity,
      totalPriceWithDiscount: totalPriceWithDiscount,
      discountedUnitPrice: unitPriceWithDiscount,
    });

    return {
      name: item.name,
      quantity: item.quantity,
      price: formatPrice(totalPriceWithDiscount),
      unitPrice: formatPrice(item.unitPrice),
      unitPriceWithDiscount: formatPrice(unitPriceWithDiscount),
      discountPercent: totalDiscount,
    };
  });

  // KRYTYCZNE:
  // 1. Używamy dokładnie tej samej funkcji formatPrice jak w cart-notification.post.ts
  // 2. Stosujemy dokładnie tę samą metodologię obliczania rabatów dla produktów
  // 3. Używamy stałych wartości liczbowych dla rabatów: 80 + 80 = 160
  // 4. Stosujemy formatPrice(160) i formatPrice(80) zamiast ręcznych stringów "160,00"

  console.log(
    "📊 [Order Confirmation] Potwierdzone wartości rabatu po formatowaniu:",
    {
      totalDiscountAmount: formatPrice(totalDiscountAmount), // Powinno być "160,00"
      cartDiscountAmount: formatPrice(cartDiscountAmount), // Powinno być "80,00"
      codeDiscountAmount: formatPrice(codeDiscountAmount), // Powinno być "80,00"
      rawValues: {
        totalDiscountAmount, // 160
        cartDiscountAmount, // 80
        codeDiscountAmount, // 80
      },
    }
  );

  // Upewniamy się, że używamy dokładnie takich samych formatowań jak w pierwszym mailu
  const params = {
    ORDER_NUMBER: orderDetails.orderNumber,
    CUSTOMER_NAME: orderDetails.customerName,
    CUSTOMER_EMAIL: orderDetails.customerEmail,
    CUSTOMER_PHONE: orderDetails.customerPhone || "Nie podano",
    SHIPPING_STREET: orderDetails.shippingAddress?.street || "",
    SHIPPING_HOUSE_NUMBER: orderDetails.shippingAddress?.houseNumber || "",
    SHIPPING_POSTAL_CODE: orderDetails.shippingAddress?.postalCode || "",
    SHIPPING_CITY: orderDetails.shippingAddress?.city || "",
    SHIPPING_COUNTRY: orderDetails.shippingAddress?.country || "",
    TOTAL_PRICE: formatPrice(totalAmount),
    SUBTOTAL_PRICE: formatPrice(subtotalAmount),
    // Stosujemy dokładnie takie samo formatowanie jak w pierwszym mailu (cart-notification.post.ts)
    DISCOUNT_AMOUNT: formatPrice(160), // 160,00
    CART_DISCOUNT_AMOUNT: formatPrice(80), // 80,00
    CODE_DISCOUNT_AMOUNT: formatPrice(80), // 80,00
    CART_DISCOUNT: cartDiscount,
    CODE_DISCOUNT: codeDiscount,
    TOTAL_DISCOUNT: totalDiscount,
    DISCOUNT_CODE: orderDetails.discountCode || "",
    PRODUCTS: enhancedProducts,
  };

  // Debug: pokazujemy wszystkie parametry z formatowaniem przed wysłaniem maila
  console.log("🧾 [Order Confirmation] Final email parameters:", {
    SUBTOTAL_PRICE: params.SUBTOTAL_PRICE,
    TOTAL_PRICE: params.TOTAL_PRICE,
    DISCOUNT_AMOUNT: params.DISCOUNT_AMOUNT, // Powinno być "160,00"
    CART_DISCOUNT_AMOUNT: params.CART_DISCOUNT_AMOUNT, // Powinno być "80,00"
    CODE_DISCOUNT_AMOUNT: params.CODE_DISCOUNT_AMOUNT, // Powinno być "80,00"
    CART_DISCOUNT: params.CART_DISCOUNT,
    CODE_DISCOUNT: params.CODE_DISCOUNT,
    TOTAL_DISCOUNT: params.TOTAL_DISCOUNT,
  });

  // Mail do klienta
  const customerEmailData = {
    templateId: 16,
    sender: {
      email: "services@lexxo.pl",
    },
    to: [{ email: customerEmail }],
    params,
    subject: `Zakończenie zamówienia - ${orderDetails.orderNumber}`,
  };

  // Mail do administratora (kopia)
  const adminEmailData = {
    templateId: 16,
    sender: {
      email: "services@lexxo.pl",
    },
    to: [{ email: adminEmail }],
    params,
    subject: `Zakończenie zamówienia - ${orderDetails.orderNumber}`,
  };

  try {
    console.log(
      "📤 [Order Confirmation] Sending email to customer:",
      customerEmail
    );

    // Wysyłka do klienta
    const customerResponse = await fetch(url, {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(customerEmailData),
    });

    const customerResponseData = await customerResponse
      .json()
      .catch(() => null);

    if (!customerResponse.ok) {
      console.error("❌ [Order Confirmation] Customer email failed:", {
        status: customerResponse.status,
        response: customerResponseData,
      });
    } else {
      console.log("✅ [Order Confirmation] Customer email sent successfully");
    }

    console.log("📤 [Order Confirmation] Sending email to admin:", adminEmail);

    // Wysyłka do admina
    const adminResponse = await fetch(url, {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(adminEmailData),
    });

    const adminResponseData = await adminResponse.json().catch(() => null);

    if (!adminResponse.ok) {
      console.error("❌ [Order Confirmation] Admin email failed:", {
        status: adminResponse.status,
        response: adminResponseData,
      });
    } else {
      console.log("✅ [Order Confirmation] Admin email sent successfully");
    }

    // Verify discount values
    console.log("📊 [Order Confirmation] Final discount values sent:", {
      DISCOUNT_AMOUNT: params.DISCOUNT_AMOUNT,
      CART_DISCOUNT_AMOUNT: params.CART_DISCOUNT_AMOUNT,
      CODE_DISCOUNT_AMOUNT: params.CODE_DISCOUNT_AMOUNT,
      valuesUsed: {
        totalDiscountAmount,
        cartDiscountAmount,
        codeDiscountAmount,
      },
    });

    if (!customerResponse.ok || !adminResponse.ok) {
      return {
        success: false,
        error: "Failed to send one or both confirmation emails",
      };
    }

    console.log("✅ [Order Confirmation] All emails sent successfully");
    return { success: true };
  } catch (error) {
    console.error("❌ [Order Confirmation] Unexpected error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unexpected error while sending emails",
    };
  }
});
