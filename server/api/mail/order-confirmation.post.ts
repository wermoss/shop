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
    TOTAL_PRICE: Number(orderDetails.amount).toFixed(2),
    PRODUCTS: orderDetails.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: Number(item.price).toFixed(2),
    })),
  };

  // Mail do klienta
  const customerEmailData = {
    templateId: 16,
    to: [{ email: customerEmail }],
    params,
  };

  // Mail do administratora (kopia)
  const adminEmailData = {
    templateId: 16,
    to: [{ email: adminEmail }],
    params,
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
