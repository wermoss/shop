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

  // Funkcja do formatowania cen w stylu polskim - użyj dokładnie takiego samego formatowania jak w cart-notification
  const formatPrice = (price) => {
    // Najpierw zaokrąglij do dwóch miejsc po przecinku aby uniknąć problemów z 0.01 PLN
    const roundedPrice = Math.round(price * 100) / 100;
    return new Intl.NumberFormat("pl-PL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(roundedPrice);
  };

  // Wartości z webhooka - nie robimy parseFloat na liczbach które już są liczbami
  // Dla pewności zaokrąglamy wartości do dwóch miejsc po przecinku, aby mieć spójne wyniki
  const subtotalAmount = Math.round(orderDetails.subtotalAmount * 100) / 100;
  const discountAmount = Math.round(orderDetails.discountAmount * 100) / 100;
  const totalAmount = Math.round(orderDetails.amount * 100) / 100;

  // Dodajemy szczegółową informację o kwotach dla debugowania
  console.log("🔢 [Order Confirmation] Rounded values:", {
    originalSubtotal: orderDetails.subtotalAmount,
    roundedSubtotal: subtotalAmount,
    originalDiscount: orderDetails.discountAmount,
    roundedDiscount: discountAmount,
    originalTotal: orderDetails.amount,
    roundedTotal: totalAmount,
  });

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
    discount: discountAmount,
    total: totalAmount,
    discountPercent: totalDiscount,
  });

  // Dla każdego produktu dodajemy informacje o cenie jednostkowej i rabacie
  const enhancedProducts = orderDetails.items.map((item: OrderItem) => {
    // Obliczamy cenę po rabacie - zaokrąglij tak samo jak w innych miejscach
    const unitPriceWithDiscount =
      Math.round(item.unitPrice * (1 - totalDiscount / 100) * 100) / 100;
    const totalPriceWithDiscount =
      Math.round(unitPriceWithDiscount * item.quantity * 100) / 100;

    // Dla debugowania - loguj każdy produkt i jego ceny
    console.log(`📝 [Order Confirmation] Product ${item.name} calculations:`, {
      originalPrice: item.unitPrice,
      quantity: item.quantity,
      discountedUnitPrice: unitPriceWithDiscount,
      totalPriceWithDiscount: totalPriceWithDiscount,
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

  // Przygotuj parametry w takiej samej strukturze dla obu maili
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
    DISCOUNT_AMOUNT: formatPrice(discountAmount),
    CART_DISCOUNT: cartDiscount,
    CODE_DISCOUNT: codeDiscount,
    TOTAL_DISCOUNT: totalDiscount,
    DISCOUNT_CODE: orderDetails.discountCode || "",
    PRODUCTS: enhancedProducts,
  };

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
