import { defineEventHandler, readBody } from "h3";
import fetch from "node-fetch";
import type { Product } from "~/types/shop";

interface CartItem {
  product: Product;
  quantity: number;
}

interface OrderDetails {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  appliedDiscountCode: string;
  items: CartItem[];
  subtotalAmount: number;
  finalAmount: number;
  codeDiscountPercent: number;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiKey = config.brevo?.apiKey;

  console.log("📣 [Influencer Notification] PROCESSING EMAIL REQUEST");

  // Dodaj więcej informacji o źródle żądania
  const headers = event.node.req.headers;
  console.log(
    "📣 [Influencer Notification] Request headers:",
    JSON.stringify(headers, null, 2)
  );

  console.log("📣 [Influencer Notification] Reading request body");

  // Logujemy pełny obiekt otrzymany w body dla celów diagnostycznych
  const body = await readBody(event);
  console.log(
    "📣 [Influencer Notification] Received request body:",
    JSON.stringify(body, null, 2)
  );

  // Dostosowanie do różnych formatów danych wejściowych
  let influencerEmail: string;
  let orderDetails: OrderDetails;

  if (typeof body === "object" && body !== null) {
    // Normalny przypadek - obiekt z influencerEmail i orderDetails
    if ("influencerEmail" in body && "orderDetails" in body) {
      influencerEmail = (body as any).influencerEmail;
      orderDetails = (body as any).orderDetails;
      console.log(
        "📣 [Influencer Notification] Standardowy format danych - znaleziono influencerEmail i orderDetails"
      );
    }
    // Przypadek, gdy mamy emailPayload z Stripe webhook
    else if (
      "customerEmail" in body &&
      "influencerEmail" in body &&
      "orderDetails" in body
    ) {
      influencerEmail = (body as any).influencerEmail;
      orderDetails = (body as any).orderDetails;
      console.log(
        "📣 [Influencer Notification] Format emailPayload - znaleziono customerEmail, influencerEmail i orderDetails"
      );
    }
    // Inne formaty - próbujemy wyciągnąć dane
    else {
      console.warn(
        "⚠️ [Influencer Notification] Unexpected data format - trying to extract required fields"
      );
      influencerEmail =
        (body as any).influencerEmail ||
        (body as any).email ||
        (body as any).recipient ||
        "";

      orderDetails =
        (body as any).orderDetails ||
        (body as any).order ||
        (body as any).details ||
        {};

      console.log(
        "📣 [Influencer Notification] Wyekstrahowane dane z niestandardowego formatu:",
        {
          foundInfluencerEmail: !!influencerEmail,
          foundOrderDetails: !!orderDetails,
        }
      );
    }
  } else {
    influencerEmail = "";
    orderDetails = {} as OrderDetails;
    console.error(
      "❌ [Influencer Notification] Invalid request body format:",
      body
    );
  }

  // Dodatkowe logowanie dla celów diagnostycznych
  console.log("🚨 [Influencer Notification] Extracted data:");
  console.log(`  - Influencer Email: ${influencerEmail || "NOT FOUND"}`);
  console.log(`  - Order Number: ${orderDetails?.orderNumber || "NOT FOUND"}`);
  console.log(
    `  - Customer Email: ${orderDetails?.customerEmail || "NOT FOUND"}`
  );
  console.log(
    `  - Discount Code: ${orderDetails?.appliedDiscountCode || "NOT FOUND"}`
  );
  console.log(`  - Items Count: ${orderDetails?.items?.length || 0}`);

  if (!influencerEmail || !orderDetails) {
    console.error("❌ [Influencer Notification] Missing required data:", {
      influencerEmail,
      hasOrderDetails: !!orderDetails,
    });
    return { success: false, error: "Missing required data" };
  }

  console.log(
    `📧 [Influencer Notification] Sending email to influencer: ${influencerEmail}`
  );
  console.log(
    `📦 [Influencer Notification] Order details:`,
    JSON.stringify(orderDetails, null, 2)
  );

  // Funkcja do formatowania cen w stylu polskim
  const formatPrice = (price: number): string => {
    // Najpierw zaokrąglij do dwóch miejsc po przecinku aby uniknąć problemów z 0.01 PLN
    const roundedPrice = Math.round(price * 100) / 100;
    const formatted = new Intl.NumberFormat("pl-PL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(roundedPrice);

    return formatted;
  };

  try {
    // Dodajemy dodatkowego administratora w kopii, aby zwiększyć szanse doręczenia
    const adminEmail = "services@wooboo.pl";

    console.log(
      `📧 [Influencer Notification] Adding admin in copy: ${adminEmail}`
    );

    const emailData = {
      sender: {
        name: "NuxtShop",
        email: "services@lexxo.pl", // Używamy zweryfikowanego adresu email
      },
      to: [
        {
          email: influencerEmail,
          name: "Partner NuxtShop",
        },
      ],
      // Dodajemy cc do administratora zamiast dodawania go jako głównego odbiorcę
      cc: [
        {
          email: adminEmail,
          name: "Administrator NuxtShop",
        },
      ],
      subject: `Kod rabatowy został wykorzystany! Zamówienie #${orderDetails.orderNumber}`,
      htmlContent: `
        <html>
          <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #000;">Twój kod rabatowy został wykorzystany!</h1>
              </div>
              
              <p>Witaj Partnerze,</p>
              
              <p>Twój kod rabatowy <strong>${
                orderDetails.appliedDiscountCode
              }</strong> został właśnie wykorzystany przez klienta. 
                 Zamówienie zostało złożone na kwotę <strong>${formatPrice(
                   orderDetails.finalAmount
                 )} zł</strong> 
                 (wartość przed rabatem: ${formatPrice(
                   orderDetails.subtotalAmount
                 )} zł).</p>
              
              <div style="margin: 30px 0; border: 1px solid #eee; padding: 20px;">
                <h2 style="margin-top: 0;">Numer zamówienia: #${
                  orderDetails.orderNumber
                }</h2>
                
                <p>Klient: ${orderDetails.customerName || "Anonimowy"}</p>
                <p>Email: ${orderDetails.customerEmail || "Brak"}</p>
                <p>Zastosowany kod: ${orderDetails.appliedDiscountCode} (${
        orderDetails.codeDiscountPercent
      }%)</p>
                
                <h3>Zamówione produkty:</h3>
                <ul>
                ${orderDetails.items
                  .map(
                    (item) => `
                  <li>
                    ${item.product.name} - Ilość: ${
                      item.quantity
                    } x ${formatPrice(item.product.price)} zł
                  </li>
                `
                  )
                  .join("")}
                </ul>
              </div>
              
              <p>Dziękujemy za współpracę!</p>
              
              <p>Pozdrawiamy,<br>Zespół NuxtShop</p>
            </div>
          </body>
        </html>
      `,
    };

    console.log(
      "📧 [Influencer Notification] Preparing to send email via Brevo API"
    );
    console.log("📧 [Influencer Notification] API Key available:", !!apiKey);

    // Dodajemy User-Agent header, który może pomóc w identyfikacji źródła żądania
    // i zapobiec filtrowaniu jako spam
    const userAgent = "NuxtShop/1.0 (Webhook; influencer-notification)";

    // Logowanie danych do wysyłki (bezpieczne - bez klucza API)
    console.log("📧 [Influencer Notification] Email data:", {
      to: emailData.to,
      cc: emailData.cc,
      subject: emailData.subject,
      sender: emailData.sender,
    });

    // Używamy fetch z dodatkowymi opcjami
    console.log("📧 [Influencer Notification] Sending request to Brevo API...");
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
        "User-Agent": userAgent,
      },
      body: JSON.stringify(emailData),
    });

    console.log(
      "📧 [Influencer Notification] Brevo API status code:",
      response.status
    );
    const responseData = await response.json();
    console.log(
      "📧 [Influencer Notification] Brevo API response:",
      responseData
    );

    if (!response.ok) {
      console.error(
        "❌ [Influencer Notification] Brevo API error:",
        responseData
      );
      return { success: false, error: responseData };
    }

    console.log(
      "✅ [Influencer Notification] Email sent successfully to influencer:",
      influencerEmail,
      "and admin:",
      adminEmail
    );

    return {
      success: true,
      data: responseData,
      recipients: {
        influencer: influencerEmail,
        admin: adminEmail,
      },
    };
  } catch (error: any) {
    console.error("❌ [Influencer Notification] Error sending email:", error);
    console.error("❌ [Influencer Notification] Error details:", {
      message: error.message || "Unknown error",
      name: error.name,
      stack: error.stack,
    });
    return { success: false, error: error.message || "Unknown error" };
  }
});
