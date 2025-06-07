import { defineEventHandler, readBody } from "h3";
import fetch from "node-fetch";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiKey = config.brevo?.apiKey;
  const adminEmail = config.brevo?.adminEmail;
  const url = "https://api.brevo.com/v3/smtp/email";

  if (!apiKey) {
    console.error("[Cart Notification] Missing Brevo API key in configuration");
    return { success: false, error: "Missing API key configuration" };
  }

  if (!adminEmail) {
    console.error("[Cart Notification] Missing admin email in configuration");
    return { success: false, error: "Missing admin email configuration" };
  }

  const { cartDetails } = await readBody(event);

  if (!cartDetails) {
    console.error("[Cart Notification] Missing cart details in request");
    return { success: false, error: "Missing cart details" };
  }

  // Funkcja do formatowania cen w stylu polskim (identyczna jak w order-confirmation)
  const formatPrice = (price) => {
    // Najpierw zaokrąglij do dwóch miejsc po przecinku aby uniknąć problemów z 0.01 PLN
    const roundedPrice = Math.round(price * 100) / 100;
    return new Intl.NumberFormat("pl-PL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(roundedPrice);
  };

  // Obliczenie rabatów dla koszyka - używamy dokładnie tej samej logiki jak w create-session.post.ts
  const subtotalPrice = cartDetails.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Pobierz rabaty z cartDetails
  const cartDiscount = cartDetails.cartDiscountPercent || 0;
  const codeDiscount = cartDetails.codeDiscountPercent || 0;
  const totalDiscount = cartDiscount + codeDiscount;

  // Obliczanie rabatu i finalnej kwoty - z zaokrągleniem
  const discountAmount =
    Math.round(subtotalPrice * (totalDiscount / 100) * 100) / 100;
  const finalPrice = Math.round((subtotalPrice - discountAmount) * 100) / 100;

  // Logowanie w celu debugowania obliczeń
  console.log("💰 [Cart Notification] Price calculations:", {
    subtotalPrice,
    discountAmount,
    finalPrice,
    totalDiscount,
    calculationSteps: {
      discountRaw: subtotalPrice * (totalDiscount / 100),
      discountRounded:
        Math.round(subtotalPrice * (totalDiscount / 100) * 100) / 100,
      finalRaw: subtotalPrice - discountAmount,
      finalRounded: Math.round((subtotalPrice - discountAmount) * 100) / 100,
    },
  });

  // Tworzenie danych produktów z uwzględnieniem ceny po rabacie i informacji o rabacie
  const products = cartDetails.items.map((item) => {
    // Obliczenie ceny jednostkowej po rabacie z zaokrągleniem (tak samo jak w order-confirmation)
    const unitPrice = item.product.price;
    const unitPriceWithDiscount =
      Math.round(unitPrice * (1 - totalDiscount / 100) * 100) / 100;

    // Całkowita cena za wszystkie sztuki po rabacie z zaokrągleniem
    const totalPrice =
      Math.round(unitPriceWithDiscount * item.quantity * 100) / 100;

    return {
      name: item.product.name,
      quantity: item.quantity,
      price: formatPrice(totalPrice), // Cena za wszystkie sztuki z rabatem
      unitPrice: formatPrice(unitPrice), // Cena jednostkowa przed rabatem
      unitPriceWithDiscount: formatPrice(unitPriceWithDiscount), // Cena jednostkowa po rabacie
      discountPercent: totalDiscount, // Wysokość rabatu w procentach
    };
  });

  const orderNumber = cartDetails.orderNumber;

  const emailData = {
    templateId: 17,
    sender: {
      email: "services@lexxo.pl",
    },
    to: [{ email: adminEmail }],
    params: {
      ORDER_NUMBER: orderNumber,
      CUSTOMER_NAME: cartDetails.customerName,
      CUSTOMER_EMAIL: cartDetails.customerEmail,
      CUSTOMER_PHONE: cartDetails.customerPhone || "Nie podano",
      SHIPPING_STREET: cartDetails.shippingAddress?.street || "",
      SHIPPING_HOUSE_NUMBER: cartDetails.shippingAddress?.houseNumber || "",
      SHIPPING_POSTAL_CODE: cartDetails.shippingAddress?.postalCode || "",
      SHIPPING_CITY: cartDetails.shippingAddress?.city || "",
      SHIPPING_COUNTRY: cartDetails.shippingAddress?.country || "",
      TOTAL_PRICE: formatPrice(finalPrice), // Formatowanie łącznej kwoty w stylu polskim
      SUBTOTAL_PRICE: formatPrice(subtotalPrice),
      DISCOUNT_AMOUNT: formatPrice(discountAmount),
      CART_DISCOUNT: cartDiscount,
      CODE_DISCOUNT: codeDiscount,
      TOTAL_DISCOUNT: totalDiscount,
      DISCOUNT_CODE: cartDetails.discountCode || "",
      PRODUCTS: products,
    },
    subject: `Rozpoczęcie zamówienia - ${orderNumber}`,
  };

  console.log(
    "[Cart Notification] Preparing to send email with data:",
    emailData.params
  );

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    const responseData = await response.json().catch(() => null);

    if (!response.ok) {
      console.error("[Cart Notification] API response error:", {
        status: response.status,
        statusText: response.statusText,
        body: responseData,
      });
      return {
        success: false,
        error: responseData?.message || "Failed to send notification email",
      };
    }

    console.log("[Cart Notification] Email sent successfully:", responseData);
    return { success: true };
  } catch (error) {
    console.error("[Cart Notification] Unexpected error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unexpected error while sending email",
    };
  }
});
