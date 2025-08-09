import { defineEventHandler, readBody } from "h3";
import fetch from "node-fetch";

// Interfejsy dla lepszego typowania
interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  priceWithDiscount: number;
  discountAmount: number;
  image?: string;
}

interface ShippingAddress {
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  country: string;
}

interface OrderDetails {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: ShippingAddress;
  subtotalAmount: number;
  cartDiscountPercent: number;
  cartDiscountAmount: number;
  codeDiscountPercent: number;
  codeDiscountAmount: number;
  totalDiscountAmount: number;
  appliedDiscountCode: string;
  amount: number;
  items: OrderItem[];
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiKey = config.brevo?.apiKey;
  const adminEmail = "services@wooboo.pl"; // Force admin email to be services@wooboo.pl
  const url = "https://api.brevo.com/v3/smtp/email";

  console.log("📧 [Order Confirmation] Starting to process emails");

  // Log the raw request body for debugging
  const rawBody = await readBody(event);
  console.log(
    "📧 [Order Confirmation] Raw request body:",
    JSON.stringify(rawBody, null, 2)
  );

  const { customerEmail, influencerEmail, orderDetails } = rawBody as {
    customerEmail: string;
    influencerEmail?: string;
    orderDetails: OrderDetails;
  };

  console.log("📧 [Order Confirmation] Extracted values:");
  console.log(`- Customer Email: ${customerEmail}`);
  console.log(`- Influencer Email: ${influencerEmail || "None provided"}`);
  console.log(`- Order Details Present: ${!!orderDetails}`);

  if (!customerEmail || !orderDetails) {
    console.error("❌ [Order Confirmation] Missing required data:", {
      customerEmail,
      hasOrderDetails: !!orderDetails,
    });
    return { success: false, error: "Missing required data" };
  }

  console.log("📦 [Order Confirmation] Received order details:", orderDetails);

  // Funkcja do formatowania cen w stylu polskim - użyj DOKŁADNIE takiej samej implementacji jak w cart-notification
  const formatPrice = (price: number): string => {
    // Najpierw zaokrąglij do dwóch miejsc po przecinku aby uniknąć problemów z 0.01 PLN
    const roundedPrice = Math.round(price * 100) / 100;
    const formatted = new Intl.NumberFormat("pl-PL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(roundedPrice);

    return formatted;
  };

  // Używamy wartości przekazanych z webhook, obliczonych przez calculateOrderTotals
  const subtotalAmount = orderDetails.subtotalAmount;
  const cartDiscountPercent = orderDetails.cartDiscountPercent;
  const cartDiscountAmount = orderDetails.cartDiscountAmount;
  const codeDiscountPercent = orderDetails.codeDiscountPercent;
  const codeDiscountAmount = orderDetails.codeDiscountAmount;
  const totalDiscountAmount = orderDetails.totalDiscountAmount;
  const finalAmount = orderDetails.amount;
  const appliedDiscountCode = orderDetails.appliedDiscountCode;

  // Logowanie wartości rabatów dla celów diagnostycznych
  console.log("💰 [Order Confirmation] Using discount values from webhook:", {
    subtotalAmount,
    cartDiscountPercent,
    cartDiscountAmount,
    codeDiscountPercent,
    codeDiscountAmount,
    totalDiscountAmount,
    finalAmount,
    appliedDiscountCode,
  });

  // Przygotuj adres wysyłki w czytelnej formie
  const formattedShippingAddress = `${orderDetails.shippingAddress.street} ${orderDetails.shippingAddress.houseNumber}, ${orderDetails.shippingAddress.postalCode} ${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.country}`;

  // Email z potwierdzeniem zamówienia - dla klienta
  try {
    console.log(
      `📧 [Order Confirmation] Sending email to customer: ${customerEmail} and admin: ${adminEmail}${
        influencerEmail ? ` and influencer: ${influencerEmail}` : ""
      }`
    );

    // Debug log all order details
    console.log(
      `📦 [Order Confirmation] Full order details dump:`,
      JSON.stringify(orderDetails, null, 2)
    );

    // Przygotowanie odbiorców emaila
    const emailRecipients = [
      {
        email: customerEmail,
        name: orderDetails.customerName || customerEmail,
      },
      {
        email: adminEmail,
        name: "Administrator NuxtShop",
      },
    ];

    // Dodaj email influencera jeśli jest dostępny
    console.log(
      `📧 [Order Confirmation] Checking influencer email: ${
        influencerEmail || "None"
      }`
    );

    if (influencerEmail && influencerEmail.trim() !== "") {
      console.log(
        `📧 [Order Confirmation] Adding influencer as recipient: ${influencerEmail}`
      );
      emailRecipients.push({
        email: influencerEmail,
        name: "Partner NuxtShop",
      });
    } else {
      console.log(`📧 [Order Confirmation] No valid influencer email to add`);
    }

    console.log(
      `📧 [Order Confirmation] Final email recipients:`,
      JSON.stringify(emailRecipients, null, 2)
    );

    // Przygotowanie szczegółów koszyka dla emaila - wysyłamy do wszystkich odbiorców
    const emailData = {
      sender: {
        name: "NuxtShop",
        email: "services@lexxo.pl", // Użyj zweryfikowanego adresu email
      },
      to: emailRecipients,
      subject: `Dziękujemy za zakup! Zamówienie #${orderDetails.orderNumber}`,
      htmlContent: `
        <html>
          <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #000;">Dziękujemy za zamówienie!</h1>
              </div>
              
              <p>Witaj ${orderDetails.customerName || ""},</p>
              
              <p>Twoje zamówienie zostało przyjęte do realizacji. Poniżej znajdziesz szczegółowy wykaz zamówionych produktów.</p>
              
              <div style="margin: 30px 0; border: 1px solid #eee; padding: 20px;">
                <h2 style="margin-top: 0;">Numer zamówienia: #${
                  orderDetails.orderNumber
                }</h2>
                
                ${orderDetails.items
                  .map(
                    (product) => `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
                      <div>
                        <strong>${product.name}</strong><br>
                        <span>Ilość: ${product.quantity} x ${formatPrice(
                      product.unitPrice
                    )} zł</span>
                        ${
                          product.discountAmount > 0
                            ? `<br><span style="color: #4CAF50;">Rabat: -${formatPrice(
                                product.discountAmount
                              )} zł</span>`
                            : ""
                        }
                      </div>
                      <div style="text-align: right;">
                        <strong>${formatPrice(
                          product.priceWithDiscount
                        )} zł</strong>
                      </div>
                    </div>
                  `
                  )
                  .join("")}
                
                <div style="margin-top: 20px; text-align: right;">
                  <p>Wartość produktów: <strong>${formatPrice(
                    subtotalAmount
                  )} zł</strong></p>
                  
                  ${
                    cartDiscountAmount > 0
                      ? `<p style="color: #4CAF50;">Rabat ilościowy (${cartDiscountPercent}%): -<strong>${formatPrice(
                          cartDiscountAmount
                        )} zł</strong></p>`
                      : ""
                  }
                  
                  ${
                    codeDiscountAmount > 0
                      ? `<p style="color: #4CAF50;">Rabat z kodu ${appliedDiscountCode} (${codeDiscountPercent}%): -<strong>${formatPrice(
                          codeDiscountAmount
                        )} zł</strong></p>`
                      : ""
                  }
                  
                  <p style="font-size: 18px; font-weight: bold;">Do zapłaty: ${formatPrice(
                    finalAmount
                  )} zł</p>
                </div>
              </div>
              
              <div style="margin: 30px 0; border: 1px solid #eee; padding: 20px;">
                <h2 style="margin-top: 0;">Dane dostawy</h2>
                <p>
                  ${orderDetails.customerName}<br>
                  ${formattedShippingAddress}<br>
                  ${
                    orderDetails.customerPhone
                      ? orderDetails.customerPhone + "<br>"
                      : ""
                  }
                  ${orderDetails.customerEmail}
                </p>
              </div>
              
              <p>Dziękujemy za zakupy w naszym sklepie!</p>
              
              <p>Pozdrawiamy,<br>Zespół NuxtShop</p>
            </div>
          </body>
        </html>
      `,
    };

    // Prepare the email data for debug logging
    console.log(
      `📧 [Order Confirmation] Preparing to send email with ${emailRecipients.length} recipients`
    );
    console.log(
      `📧 [Order Confirmation] Recipients emails:`,
      emailRecipients.map((r) => r.email).join(", ")
    );

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
        `❌ [Order Confirmation] Failed to send customer email:`,
        errorData
      );
      return {
        success: false,
        error: "Failed to send customer email",
        details: errorData,
        recipient: customerEmail,
      };
    }

    const recipients: Record<string, string> = {
      customer: customerEmail,
      admin: adminEmail,
    };
    if (influencerEmail) {
      recipients.influencer = influencerEmail;
    }

    console.log(
      `✅ [Order Confirmation] Email sent successfully to customer: ${customerEmail}, administrator: ${adminEmail}${
        influencerEmail ? `, and influencer: ${influencerEmail}` : ""
      }`
    );

    // Jeśli mamy email influencera, wyślij również powiadomienie do niego
    if (influencerEmail && influencerEmail.trim() !== "") {
      try {
        console.log(
          `� [Order Confirmation] INFLUENCER NOTIFICATION: Now sending to: ${influencerEmail}`
        );

        // Przygotuj dane dla API powiadomienia influencera
        const influencerPayload = {
          influencerEmail: influencerEmail,
          orderDetails: {
            customerName: orderDetails.customerName,
            customerEmail: orderDetails.customerEmail,
            orderNumber: orderDetails.orderNumber,
            appliedDiscountCode: orderDetails.appliedDiscountCode || "",
            // Konwersja produktów do formatu oczekiwanego przez influencer-notification
            items: orderDetails.items.map((item) => ({
              product: {
                id: 0,
                name: item.name,
                price: item.unitPrice,
                image: item.image || "",
                description: "",
              },
              quantity: item.quantity,
            })),
            subtotalAmount: orderDetails.subtotalAmount,
            finalAmount: orderDetails.amount,
            codeDiscountPercent: orderDetails.codeDiscountPercent,
          },
        };

        console.log(
          `� [Order Confirmation] INFLUENCER NOTIFICATION: Complete payload:`,
          JSON.stringify(influencerPayload, null, 2)
        );

        // Wewnętrznie wywołaj endpoint influencer-notification
        // Pobierz URL bazowy dla spójności z resztą kodu
        const headers = event.node.req.headers;
        const protocol = headers["x-forwarded-proto"] || "http";
        const host = headers["x-forwarded-host"] || headers.host;
        const baseUrl = `${protocol}://${host}`;

        const influencerNotificationUrl = `${baseUrl}/api/mail/influencer-notification`;
        console.log(
          `� [Order Confirmation] INFLUENCER NOTIFICATION: Calling API: ${influencerNotificationUrl}`
        );

        // Definiujemy interfejs dla odpowiedzi
        interface InfluencerNotificationResponse {
          success: boolean;
          data?: any;
          recipients?: {
            influencer: string;
            admin: string;
          };
          error?: any;
        }

        const influencerResult = await $fetch<InfluencerNotificationResponse>(
          influencerNotificationUrl,
          {
            method: "POST",
            body: influencerPayload,
            timeout: 60000, // Zwiększamy timeout do 60 sekund
            // Dodajemy retry aby zapewnić, że request zostanie wykonany nawet przy problemach sieciowych
            retry: 3,
          }
        );

        console.log(
          `� [Order Confirmation] INFLUENCER NOTIFICATION: API result:`,
          JSON.stringify(influencerResult, null, 2)
        );

        if (influencerResult.success) {
          console.log(
            `✅ [Order Confirmation] INFLUENCER NOTIFICATION SUCCESS! Email sent to: ${influencerEmail}`
          );

          // Sprawdź czy mail został faktycznie wysłany i odbiorca jest prawidłowy
          if (influencerResult.recipients?.influencer === influencerEmail) {
            console.log(
              `✅ [Order Confirmation] INFLUENCER NOTIFICATION VERIFIED: Recipient matches requested email`
            );
          } else {
            console.warn(
              `⚠️ [Order Confirmation] INFLUENCER NOTIFICATION WARNING: Recipient mismatch`
            );
            console.warn(`  - Expected: ${influencerEmail}`);
            console.warn(
              `  - Actual: ${
                influencerResult.recipients?.influencer || "unknown"
              }`
            );
          }
        } else {
          console.error(
            `❌ [Order Confirmation] INFLUENCER NOTIFICATION FAILED!`,
            influencerResult.error
              ? JSON.stringify(influencerResult.error)
              : "Unknown error"
          );
        }
      } catch (influencerError: any) {
        console.error(
          `❌ [Order Confirmation] Error sending influencer notification:`,
          influencerError
        );
        console.error(`❌ [Order Confirmation] Error details:`, {
          message: influencerError.message || "Unknown error",
          name: influencerError.name,
          stack: influencerError.stack,
        });
        // Nie blokujemy sukcesu głównego emaila przez błąd notyfikacji influencera
      }
    }

    return {
      success: true,
      recipients: recipients,
    };
  } catch (error: unknown) {
    console.error(`❌ [Order Confirmation] Error sending email:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      recipients: { customer: customerEmail, admin: adminEmail },
    };
  }
});
