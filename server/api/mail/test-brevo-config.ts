import { defineEventHandler } from "h3";

export default defineEventHandler(async (event) => {
  console.log("🔑 [Test] Sprawdzam konfigurację Brevo API");

  try {
    const config = useRuntimeConfig();
    const apiKey = config.brevo?.apiKey;

    // Wyświetl informacje o konfiguracji (bez pokazywania pełnego klucza)
    if (!apiKey) {
      console.error("❌ [Test] Brak klucza API Brevo w konfiguracji!");
      return {
        success: false,
        message: "Klucz API Brevo nie jest skonfigurowany",
        status: "missing",
      };
    }

    // Pokaż tylko pierwsze 4 i ostatnie 4 znaki klucza dla bezpieczeństwa
    const maskedKey =
      apiKey.length > 8
        ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`
        : "****";

    console.log(
      "🔑 [Test] Znaleziono klucz API Brevo (zamaskowany):",
      maskedKey
    );
    console.log("🔑 [Test] Długość klucza API:", apiKey.length);

    // Sprawdź czy klucz wygląda jak prawidłowy klucz Brevo (xkeysib-...)
    const isValidFormat = apiKey.startsWith("xkeysib-");
    if (!isValidFormat) {
      console.warn(
        "⚠️ [Test] Klucz API nie ma standardowego formatu Brevo (powinien zaczynać się od 'xkeysib-')"
      );
    }

    // Wykonaj testowe zapytanie do API Brevo aby sprawdzić czy klucz działa
    // To zapytanie tylko sprawdza informacje o koncie, nie wysyła żadnych emaili
    console.log(
      "🔑 [Test] Sprawdzam działanie klucza poprzez zapytanie do Brevo API..."
    );

    const response = await fetch("https://api.brevo.com/v3/account", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
    });

    const status = response.status;
    console.log("🔑 [Test] Kod odpowiedzi z Brevo API:", status);

    if (status === 200) {
      const accountInfo = await response.json();
      console.log("✅ [Test] Klucz API działa poprawnie! Pobrano dane konta.");

      // Zwróć maskowane informacje o koncie
      return {
        success: true,
        message: "Klucz API Brevo jest poprawnie skonfigurowany i działa",
        status: "valid",
        account: {
          firstName: accountInfo.firstName,
          lastName: accountInfo.lastName,
          email: accountInfo.email,
          companyName: accountInfo.companyName,
          // Nie pokazujemy pełnych szczegółów konta dla bezpieczeństwa
        },
      };
    } else {
      const errorData = await response.text();
      console.error(
        "❌ [Test] Błąd weryfikacji klucza API:",
        status,
        errorData
      );
      return {
        success: false,
        message: "Klucz API istnieje, ale został odrzucony przez serwer Brevo",
        status: "invalid",
        error: { status, data: errorData },
      };
    }
  } catch (error: any) {
    console.error(
      "❌ [Test] Błąd podczas sprawdzania konfiguracji Brevo:",
      error
    );
    return {
      success: false,
      message: "Wystąpił błąd podczas weryfikacji konfiguracji",
      error: error.message || "Nieznany błąd",
    };
  }
});
