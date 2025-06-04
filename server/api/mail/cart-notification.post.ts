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

  const products = cartDetails.items.map((item) => ({
    name: item.product.name,
    quantity: item.quantity,
    price: Number(item.finalPrice).toFixed(2),
  }));

  const orderNumber = cartDetails.orderNumber;

  const emailData = {
    templateId: 17,
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
      TOTAL_PRICE: Number(cartDetails.totalPrice).toFixed(2),
      PRODUCTS: products,
    },
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
