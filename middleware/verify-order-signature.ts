import {
  defineNuxtRouteMiddleware,
  useRoute,
  navigateTo,
  useRuntimeConfig,
} from "#imports";
import crypto from "crypto";

export default defineNuxtRouteMiddleware(async (to) => {
  // Middleware działa tylko dla strony success
  if (!to.path.includes("/shop/success")) {
    return;
  }

  const orderNumber = to.query.order as string;
  const timestamp = to.query.timestamp as string;
  const signature = to.query.signature as string;
  const config = useRuntimeConfig();

  // Debugowanie parametrów URL
  console.log("Parametry URL w middleware:", {
    pełnyURL: to.fullPath,
    orderNumber,
    timestamp,
    signature,
    wszystkieParametry: to.query,
  });

  // Sprawdź czy wszystkie parametry są obecne
  if (!orderNumber || !timestamp || !signature) {
    console.error("Brak wymaganych parametrów URL", {
      orderNumber,
      timestamp,
      signature,
    });
    return navigateTo("/shop");
  }

  try {
    // Sprawdzenie czy klucz podpisu jest dostępny
    if (!config.orderSignatureSecret) {
      console.error(
        "Brak klucza do weryfikacji podpisu (ORDER_SIGNATURE_SECRET)"
      );
      return navigateTo("/shop");
    }

    console.log("Używam klucza do weryfikacji:", {
      kluczJestDostepny: !!config.orderSignatureSecret,
      dlugosc: config.orderSignatureSecret?.length || 0,
    });

    // Weryfikacja podpisu
    const expectedSignature = crypto
      .createHmac("sha256", config.orderSignatureSecret)
      .update(`${orderNumber}:${timestamp}`)
      .digest("hex");

    // Jeśli podpis jest nieprawidłowy, przekieruj użytkownika
    if (signature !== expectedSignature) {
      console.error("Nieprawidłowy podpis URL", {
        provided: signature,
        expected: expectedSignature,
      });
      return navigateTo("/shop");
    }

    // Opcjonalnie: sprawdź czy timestamp nie jest za stary (np. 24h)
    const maxAgeMs = 24 * 60 * 60 * 1000; // 24 godziny
    if (Date.now() - parseInt(timestamp) > maxAgeMs) {
      console.error("Link wygasł - przekroczono maksymalny czas ważności");
      return navigateTo("/shop");
    }

    // Jeśli walidacja przeszła pomyślnie, zezwól na dostęp do strony
    console.log("Walidacja podpisu URL przeszła pomyślnie");

    // Dodaj zamówienie do autoryzowanych zamówień w sessionStorage
    if (process.client) {
      let authorizedOrders: string[] = [];
      const storedOrders = sessionStorage.getItem("authorized_orders");

      if (storedOrders) {
        try {
          authorizedOrders = JSON.parse(storedOrders);
        } catch (e) {
          console.error("Błąd parsowania listy autoryzowanych zamówień:", e);
        }
      }

      // Dodaj numer zamówienia jeśli jeszcze nie istnieje
      if (!authorizedOrders.includes(orderNumber)) {
        authorizedOrders.push(orderNumber);
        sessionStorage.setItem(
          "authorized_orders",
          JSON.stringify(authorizedOrders)
        );
        console.log("Dodano zamówienie do autoryzowanych:", orderNumber);
      }
    }
  } catch (error) {
    console.error("Wystąpił błąd podczas weryfikacji podpisu:", error);
    return navigateTo("/shop");
  }
});
