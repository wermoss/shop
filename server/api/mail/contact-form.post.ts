import { defineEventHandler, readBody } from "h3";
import fetch from "node-fetch";

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiKey = config.brevo?.apiKey;
  const adminEmail = config.brevo?.adminEmail;
  const url = "https://api.brevo.com/v3/smtp/email";

  if (!apiKey) {
    console.error("[Contact Form] Missing Brevo API key in configuration");
    return { success: false, error: "Missing API key configuration" };
  }

  if (!adminEmail) {
    console.error("[Contact Form] Missing admin email in configuration");
    return { success: false, error: "Missing admin email configuration" };
  }

  try {
    const formData: ContactFormData = await readBody(event);

    // Validate required fields - we now have client-side validation with VeeValidate
    // but we should still validate server-side for security
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "subject",
      "message",
    ];
    for (const field of requiredFields) {
      if (!formData[field as keyof ContactFormData]) {
        return {
          success: false,
          error: `Missing required field: ${field}`,
        };
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return {
        success: false,
        error: "Invalid email format",
      };
    }

    // Send confirmation email to the user
    const userEmailData = {
      sender: {
        name: "Nuxt Shop",
        email: "services@lexxo.pl", // Using verified sender email
      },
      to: [
        {
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`,
        },
      ],
      subject: "Potwierdzenie otrzymania wiadomości",
      htmlContent: `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #f5f5f5; padding: 20px; text-align: center; }
              .content { padding: 20px; }
              .footer { font-size: 12px; text-align: center; margin-top: 30px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Potwierdzenie otrzymania wiadomości</h1>
              </div>
              <div class="content">
                <p>Witaj ${formData.firstName} ${formData.lastName},</p>
                <p>Dziękujemy za skontaktowanie się z nami. Otrzymaliśmy Twoją wiadomość i odpowiemy najszybciej jak to możliwe.</p>
                <p>Poniżej znajduje się kopia przesłanej wiadomości:</p>
                <hr>
                <p><strong>Temat:</strong> ${formData.subject}</p>
                <p><strong>Wiadomość:</strong></p>
                <p>${formData.message.replace(/\\n/g, "<br>")}</p>
                <hr>
                <p>W przypadku pytań lub dodatkowych informacji, prosimy o kontakt.</p>
                <p>Z poważaniem,<br>Zespół Nuxt Shop</p>
              </div>
              <div class="footer">
                <p>Ta wiadomość została wygenerowana automatycznie, prosimy na nią nie odpowiadać.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    // Send notification email to the admin
    const adminEmailData = {
      sender: {
        name: "Nuxt Shop Formularz Kontaktowy",
        email: "services@lexxo.pl", // Using verified sender email
      },
      to: [
        {
          email: adminEmail,
          name: "Administrator",
        },
      ],
      subject: `Nowa wiadomość: ${formData.subject}`,
      htmlContent: `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #f5f5f5; padding: 20px; text-align: center; }
              .content { padding: 20px; }
              .field { margin-bottom: 10px; }
              .label { font-weight: bold; }
              .message { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #ccc; margin: 15px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Nowa wiadomość z formularza kontaktowego</h1>
              </div>
              <div class="content">
                <p>Otrzymano nową wiadomość z formularza kontaktowego na stronie.</p>
                
                <div class="field">
                  <div class="label">Imię i nazwisko:</div>
                  <div>${formData.firstName} ${formData.lastName}</div>
                </div>
                
                <div class="field">
                  <div class="label">Email:</div>
                  <div>${formData.email}</div>
                </div>
                
                <div class="field">
                  <div class="label">Telefon:</div>
                  <div>${formData.phone || "Nie podano"}</div>
                </div>
                
                <div class="field">
                  <div class="label">Temat:</div>
                  <div>${formData.subject}</div>
                </div>
                
                <div class="field">
                  <div class="label">Wiadomość:</div>
                  <div class="message">${formData.message.replace(
                    /\\n/g,
                    "<br>"
                  )}</div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    // Send confirmation email to user
    const userResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(userEmailData),
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      console.error(
        `❌ [Contact Form] Failed to send confirmation email:`,
        errorData
      );
      return {
        success: false,
        error: "Failed to send confirmation email",
        details: errorData,
      };
    }

    // Send notification email to admin
    const adminResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(adminEmailData),
    });

    if (!adminResponse.ok) {
      const errorData = await adminResponse.json();
      console.error(
        `❌ [Contact Form] Failed to send admin notification:`,
        errorData
      );
      // We don't return error here because the user got their confirmation
      console.log(
        `⚠️ [Contact Form] User was notified but admin notification failed`
      );
    } else {
      console.log(
        `✅ [Contact Form] Admin notification sent successfully to: ${adminEmail}`
      );
    }

    return {
      success: true,
      message: "Contact form submission processed successfully",
    };
  } catch (error: unknown) {
    console.error(`❌ [Contact Form] Error:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
});
