import { defineEventHandler, readBody } from "h3";
import fetch from "node-fetch";
import { calculateOrderTotals } from "../../utils/calculateOrderTotals";
import type { Product } from "~/types/shop";

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartDetails {
  customerEmail: string; // Zmieniono z email na customerEmail
  customerName?: string; // Zmieniono z name na customerName
  cartUrl?: string;
  items: CartItem[];
  appliedDiscountCode?: string | null;
  orderNumber?: string;
  totalPrice?: number;
  cartDiscountPercent?: number;
  codeDiscountPercent?: number;
  discountCode?: string;
  customerPhone?: string;
  shippingAddress?: {
    street: string;
    houseNumber: string;
    postalCode: string;
    city: string;
    country: string;
  };
}

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

  const { cartDetails } = await readBody<{ cartDetails: CartDetails }>(event);

  if (!cartDetails) {
    console.error("[Cart Notification] Missing cart details in request");
    return { success: false, error: "Missing cart details" };
  }

  // Funkcja do formatowania cen w stylu polskim (identyczna jak w order-confirmation)
  const formatPrice = (price: number): string => {
    // Najpierw zaokrąglij do dwóch miejsc po przecinku aby uniknąć problemów z 0.01 PLN
    const roundedPrice = Math.round(price * 100) / 100;
    return new Intl.NumberFormat("pl-PL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(roundedPrice);
  };

  // Użycie centralnej funkcji do obliczenia rabatów i sum
  // Używamy discountCode jeśli istnieje, w przeciwnym razie appliedDiscountCode
  // to rozwiązuje problem niespójności nazw pól między interfejsami
  const appliedCode =
    cartDetails.discountCode || cartDetails.appliedDiscountCode;

  const orderDetails = calculateOrderTotals(
    cartDetails.items.map((item: CartItem) => ({
      id: item.product.id,
      quantity: item.quantity,
      product: item.product,
    })),
    appliedCode
  );

  console.log("💰 [Cart Notification] Calculated order details:", {
    subtotalAmount: orderDetails.subtotalAmount,
    cartDiscountPercent: orderDetails.cartDiscountPercent,
    cartDiscountAmount: orderDetails.cartDiscountAmount,
    codeDiscountPercent: orderDetails.codeDiscountPercent,
    codeDiscountAmount: orderDetails.codeDiscountAmount,
    totalDiscountAmount: orderDetails.totalDiscountAmount,
    finalAmount: orderDetails.finalAmount,
  });

  // Tworzenie danych produktów z obliczonymi rabatami i cenami
  const products = orderDetails.productsWithCalculatedPrices.map((product) => {
    return {
      name: product.name,
      quantity: product.quantity,
      price: formatPrice(product.lineItemTotalPriceWithDiscount), // Cena za wszystkie sztuki z rabatem
      unitPrice: formatPrice(product.price), // Cena jednostkowa przed rabatem
      unitPriceWithDiscount: formatPrice(product.unitPriceWithDiscount), // Cena jednostkowa po rabacie
      discountPercent:
        orderDetails.cartDiscountPercent + orderDetails.codeDiscountPercent, // Łączna wysokość rabatu w procentach
    };
  });

  // Email z powiadomieniem o koszyku - dla klienta
  try {
    // Sprawdź czy mamy adres email przed wysłaniem
    if (!cartDetails.customerEmail) {
      console.error(
        `❌ [Cart Notification] Missing customer email in cart details:`,
        cartDetails
      );
      return { success: false, error: "Missing customer email" };
    }

    console.log(
      `📧 [Cart Notification] Sending email to customer: ${cartDetails.customerEmail}`
    );

    // Debug wszystkie dane przed wysłaniem
    console.log(`🔍 [Cart Notification] All cart details:`, {
      customerEmail: cartDetails.customerEmail,
      customerName: cartDetails.customerName,
      orderNumber: cartDetails.orderNumber,
      itemCount: cartDetails.items?.length || 0,
    });

    // Przygotowanie szczegółów koszyka dla emaila
    const emailData = {
      sender: {
        name: "NuxtShop",
        email: "services@lexxo.pl", // Użyj zweryfikowanego adresu email
      },
      to: [
        {
          email: cartDetails.customerEmail,
          name: cartDetails.customerName || cartDetails.customerEmail,
        },
      ],
      subject: "Twój koszyk w NuxtShop czeka",
      htmlContent: `
        <html>
          <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #000;">Dziękujemy za odwiedzenie naszego sklepu!</h1>
              </div>
              
              <p>Witaj ${cartDetails.customerName || ""},</p>
              
              <p>Zauważyliśmy, że zacząłeś zakupy w naszym sklepie, ale ich nie dokończyłeś. Twój koszyk wciąż na Ciebie czeka!</p>
              
              <div style="margin: 30px 0; border: 1px solid #eee; padding: 20px;">
                <h2 style="margin-top: 0;">Zawartość Twojego koszyka:</h2>
                
                ${products
                  .map(
                    (product) => `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
                      <div>
                        <strong>${product.name}</strong><br>
                        <span>Ilość: ${product.quantity} x ${product.unitPriceWithDiscount} zł</span>
                      </div>
                      <div style="text-align: right;">
                        <strong>${product.price} zł</strong>
                      </div>
                    </div>
                  `
                  )
                  .join("")}
                
                <div style="margin-top: 20px; text-align: right;">
                  <p>Wartość produktów: <strong>${formatPrice(
                    orderDetails.subtotalAmount
                  )} zł</strong></p>
                  
                  ${
                    orderDetails.cartDiscountAmount > 0
                      ? `<p style="color: #4CAF50;">Rabat ilościowy (${
                          orderDetails.cartDiscountPercent
                        }%): -<strong>${formatPrice(
                          orderDetails.cartDiscountAmount
                        )} zł</strong></p>`
                      : ""
                  }
                  
                  ${
                    orderDetails.codeDiscountAmount > 0
                      ? `<p style="color: #4CAF50;">Rabat z kodu ${
                          orderDetails.appliedDiscountCode
                        } (${
                          orderDetails.codeDiscountPercent
                        }%): -<strong>${formatPrice(
                          orderDetails.codeDiscountAmount
                        )} zł</strong></p>`
                      : ""
                  }
                  
                  <p style="font-size: 18px; font-weight: bold;">Do zapłaty: ${formatPrice(
                    orderDetails.finalAmount
                  )} zł</p>
                </div>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${
                  cartDetails.cartUrl || "https://nuxtshop.vercel.app/shop/cart"
                }" style="background-color: #000; color: #fff; padding: 12px 25px; text-decoration: none; font-weight: bold;">DOKOŃCZ ZAKUPY</a>
              </div>
              
              <p>Jeśli masz jakiekolwiek pytania dotyczące zamówienia, skontaktuj się z nami odpowiadając na tego e-maila.</p>
              
              <p>Pozdrawiamy,<br>Zespół NuxtShop</p>
            </div>
          </body>
        </html>
      `,
    };

    // Send email through Brevo
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(
        `❌ [Cart Notification] Failed to send customer email:`,
        errorData
      );
      return {
        success: false,
        error: "Failed to send customer email",
        details: errorData,
        recipient: cartDetails.customerEmail,
      };
    }

    console.log(
      `✅ [Cart Notification] Email sent successfully to ${cartDetails.customerEmail}`
    );
    return { success: true };
  } catch (error: unknown) {
    console.error(`❌ [Cart Notification] Error sending email:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      recipient: cartDetails.customerEmail || "undefined_email",
    };
  }
});
