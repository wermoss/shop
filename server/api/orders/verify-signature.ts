// Serwer API do weryfikacji i pobierania danych zamówienia
import { defineEventHandler } from "h3";
import crypto from "crypto";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const query = getQuery(event);

  const orderNumber = query.order as string;
  const timestamp = query.timestamp as string;
  const signature = query.signature as string;

  // Logowanie dla debugowania
  console.log("[API] Weryfikacja zamówienia:", { orderNumber, timestamp });

  if (!orderNumber || !timestamp || !signature) {
    return {
      verified: false,
      error: "Brak wymaganych parametrów",
    };
  }

  try {
    // Weryfikacja podpisu
    const expectedSignature = crypto
      .createHmac("sha256", config.orderSignatureSecret)
      .update(`${orderNumber}:${timestamp}`)
      .digest("hex");

    // Sprawdzenie czy podpis jest poprawny
    if (signature !== expectedSignature) {
      console.log("[API] Niepoprawny podpis", {
        provided: signature,
        expected: expectedSignature,
      });

      return {
        verified: false,
        error: "Nieprawidłowy podpis URL",
      };
    }

    // Opcjonalnie: sprawdzanie ważności linku
    const maxAgeMs = 24 * 60 * 60 * 1000; // 24 godziny
    if (Date.now() - parseInt(timestamp) > maxAgeMs) {
      return {
        verified: false,
        error: "Link wygasł",
      };
    }

    // Tutaj można by pobrać rzeczywiste dane zamówienia z bazy danych
    // Na potrzeby tego przykładu zwracamy potwierdzenie weryfikacji
    return {
      verified: true,
      orderNumber,
      timestamp,
    };
  } catch (error) {
    console.error("[API] Błąd podczas weryfikacji podpisu:", error);
    return {
      verified: false,
      error: "Wystąpił błąd podczas weryfikacji",
    };
  }
});
