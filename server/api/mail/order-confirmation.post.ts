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

  // Extract values but make influencerEmail variable so we can modify it
  const { customerEmail, orderDetails } = rawBody as {
    customerEmail: string;
    influencerEmail?: string;
    orderDetails: OrderDetails;
  };

  // Extract influencerEmail separately so we can modify it
  let influencerEmail = (rawBody as any).influencerEmail;

  console.log("📧 [Order Confirmation] Extracted values:");
  console.log(`- Customer Email: ${customerEmail}`);

  // Aggressively handle any influencerEmail to make absolutely sure it's not included
  if (influencerEmail) {
    const tempInfluencer = influencerEmail; // Save for logging only
    console.log(
      `- Influencer Email found in payload: ${tempInfluencer} - REMOVING IT COMPLETELY`
    );

    // Setting to undefined to ensure it's not used anywhere
    influencerEmail = undefined;

    // Also remove it from the raw body to be extra sure
    if (
      rawBody &&
      typeof rawBody === "object" &&
      "influencerEmail" in rawBody
    ) {
      delete (rawBody as any).influencerEmail;
      console.log(`- Removed influencerEmail from raw body`);
    }
  } else {
    console.log(`- No Influencer Email in payload (good)`);
  }
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
      `📧 [Order Confirmation] Sending email to: customer (${customerEmail}) and admin (${adminEmail}) only`
    );

    // Debug log all order details
    console.log(
      `📦 [Order Confirmation] Full order details dump:`,
      JSON.stringify(orderDetails, null, 2)
    );

    // HARDCODED - bezpośrednie przypisanie tylko 2 odbiorców
    // NIE korzystamy z wartości przekazanych w żądaniu - ustalimy je bezpośrednio
    const customerMail = orderDetails.customerEmail; // Używamy email z orderDetails, a nie z payloadu

    console.log(
      `📧 [Order Confirmation] Customer mail from orderDetails: ${customerMail}`
    );
    console.log(`📧 [Order Confirmation] Admin mail hardcoded: ${adminEmail}`);

    // Przygotowanie odbiorców emaila - TYLKO klient i admin
    const emailRecipients = [
      {
        email: customerMail,
        name: orderDetails.customerName || customerMail,
      },
      {
        email: adminEmail,
        name: "Administrator NuxtShop",
      },
    ];

    // Dodatkowe zabezpieczenie - sprawdź czy nie ma influencera w emailRecipients
    const filteredRecipients = emailRecipients.filter((recipient) => {
      const isInfluencer =
        recipient.email.includes("minister.com") ||
        recipient.email.includes("influencer") ||
        recipient.name.includes("Partner");
      if (isInfluencer) {
        console.error(
          `❌ [Order Confirmation] ZNALEZIONO INFLUENCERA W LIŚCIE ADRESATÓW: ${recipient.email} - USUWAM!`
        );
        return false;
      }
      return true;
    });

    // We don't add any influencer to this email - influencers get separate notifications
    console.log(
      `📧 [Order Confirmation] Only sending to customer and admin (no influencers)`
    );

    console.log(
      `📧 [Order Confirmation] Final email recipients:`,
      JSON.stringify(filteredRecipients, null, 2)
    );

    // Przygotowanie szczegółów koszyka dla emaila - wysyłamy TYLKO do klienta i admina
    const emailData = {
      sender: {
        name: "NuxtShop",
        email: "services@lexxo.pl", // Użyj zweryfikowanego adresu email
      },
      to: filteredRecipients, // Używamy przefiltrowanej listy odbiorców
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

    // Log the EXACT email data being sent (excluding API key)
    const emailDataClone = { ...emailData };
    console.log(
      `📧 [Order Confirmation] EXACT EMAIL PAYLOAD:`,
      JSON.stringify(emailDataClone, null, 2)
    );

    // Double check there's no CC field somehow
    if ("cc" in emailDataClone) {
      console.error(
        `❌ [Order Confirmation] UNEXPECTED CC FIELD FOUND! REMOVING IT!`
      );
      delete (emailDataClone as any).cc;
    }

    // Double check there's no bcc field either
    if ("bcc" in emailDataClone) {
      console.error(
        `❌ [Order Confirmation] UNEXPECTED BCC FIELD FOUND! REMOVING IT!`
      );
      delete (emailDataClone as any).bcc;
    }

    // Dodatkowe zabezpieczenie - sprawdzenie czy są odbiorcy typu "Partner"
    if (emailDataClone.to && Array.isArray(emailDataClone.to)) {
      const originalLength = emailDataClone.to.length;
      emailDataClone.to = emailDataClone.to.filter((recipient: any) => {
        if (!recipient || typeof recipient !== "object") return true;

        const isInfluencer =
          (recipient.email &&
            (recipient.email.includes("minister.com") ||
              recipient.email.includes("influencer") ||
              recipient.email === "konrad@minister.com")) ||
          (recipient.name &&
            (recipient.name.includes("Partner") ||
              recipient.name.includes("Partner NuxtShop")));

        if (isInfluencer) {
          console.error(
            `❌ [Order Confirmation] ZNALEZIONO INFLUENCERA W TO: ${JSON.stringify(
              recipient
            )} - USUWAM!`
          );
          return false;
        }
        return true;
      });

      if (emailDataClone.to.length !== originalLength) {
        console.error(
          `❌ [Order Confirmation] USUNIĘTO ${
            originalLength - emailDataClone.to.length
          } INFLUENCERÓW Z LISTY ODBIORCÓW!`
        );
      }

      // Dodatkowe sprawdzenie - upewnij się że lista ma dokładnie 2 odbiorców
      if (emailDataClone.to.length !== 2) {
        console.error(
          `❌ [Order Confirmation] BŁĘDNA LICZBA ODBIORCÓW: ${emailDataClone.to.length}, OCZEKIWANO 2`
        );
        console.error(
          `❌ [Order Confirmation] OBECNI ODBIORCY:`,
          JSON.stringify(emailDataClone.to, null, 2)
        );

        // Wymuszenie tylko 2 odbiorców - klient i admin
        emailDataClone.to = [
          {
            email: customerMail,
            name: orderDetails.customerName || customerMail,
          },
          { email: adminEmail, name: "Administrator NuxtShop" },
        ];
        console.error(
          `❌ [Order Confirmation] WYMUSZONO POPRAWNĄ LISTĘ ODBIORCÓW:`,
          JSON.stringify(emailDataClone.to, null, 2)
        );
      }
    }

    // OSTATECZNE SPRAWDZENIE - upewnij się że NIE MA pól cc, bcc ani innych dodatkowych odbiorców
    ["cc", "bcc", "replyTo"].forEach((field) => {
      if (field in emailDataClone) {
        console.error(
          `❌ [Order Confirmation] ZNALEZIONO DODATKOWE POLE: ${field} - USUWAM!`
        );
        delete (emailDataClone as any)[field];
      }
    });

    // Send email through Brevo
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(emailDataClone),
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

    // Only record customer and admin as recipients - no influencer should ever be included
    const recipients: Record<string, string> = {
      customer: customerEmail,
      admin: adminEmail,
    };
    // Explicitly logging all recipients for debugging
    console.log(
      `📧 [Order Confirmation] FINAL RECIPIENTS LIST: ${Object.keys(
        recipients
      ).join(", ")}`
    );

    console.log(
      `✅ [Order Confirmation] Email sent successfully to customer: ${customerEmail} and administrator: ${adminEmail} ONLY (no influencers)`
    );

    // ZMODYFIKOWANE: Usunięto wysyłanie powiadomienia dla influencera z tego miejsca, aby zapobiec duplikatom maili
    if (influencerEmail && influencerEmail.trim() !== "") {
      console.log(
        `ℹ️ [Order Confirmation] Found influencer email (${influencerEmail}), but skipping notification from order-confirmation to prevent duplicate emails. Notification will be handled by webhook.`
      );
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
