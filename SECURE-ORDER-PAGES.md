# Zabezpieczenie stron potwierdzenia zamówienia

## Wprowadzenie

Ten dokument wyjaśnia mechanizm zabezpieczający strony potwierdzenia zamówienia (success page) przed nieuprawnioną modyfikacją parametrów URL.

## Problem

Standardowo, po zakończeniu płatności Stripe, klient jest przekierowywany na stronę potwierdzenia zamówienia z parametrami w URL, takimi jak:

```
https://sklep.pl/shop/success?order=B327097&timestamp=1754657642749
```

Bez odpowiednich zabezpieczeń, dowolny użytkownik może modyfikować te parametry i potencjalnie uzyskać dostęp do informacji o innych zamówieniach.

## Rozwiązanie: Wielopoziomowe zabezpieczenia

Wdrożyliśmy kompleksowy system zabezpieczający, który składa się z kilku warstw:

1. **Podpisane URL-e (Signed URLs)**

   - Generuje cyfrowy podpis URL oparty na numerze zamówienia i timestampie
   - Dołącza ten podpis jako dodatkowy parametr URL
   - Weryfikuje integralność parametrów przy każdym dostępie do strony

2. **Weryfikacja serwerowa**

   - Endpoint API `/api/orders/verify-signature` weryfikuje podpis na poziomie serwera
   - Tylko zamówienia z poprawnym podpisem są autoryzowane do wyświetlenia

3. **Middleware bezpieczeństwa**
   - Globalne middleware blokuje nieautoryzowany dostęp do stron zamówień
   - Przekierowuje użytkownika w przypadku manipulacji parametrami URL

## Jak działa zabezpieczenie?

### 1. Generowanie bezpiecznego URL

Podczas tworzenia sesji płatności Stripe, generowany jest podpis URL:

```typescript
// Tworzymy URL sukcesu z parametrami używając klasy URL
const successUrl = new URL(`${baseUrl}/shop/success`);
successUrl.searchParams.append("order", orderNumber);
successUrl.searchParams.append("timestamp", orderTimestamp);

// Generujemy podpis
const signatureData = `${orderNumber}:${orderTimestamp}`;
const signature = crypto
  .createHmac("sha256", config.orderSignatureSecret)
  .update(signatureData)
  .digest("hex");

// Dodajemy podpis do URL
successUrl.searchParams.append("signature", signature);
```

### 2. Weryfikacja na poziomie API

Endpoint `/api/orders/verify-signature.ts` weryfikuje podpis przy każdym żądaniu:

```typescript
// Weryfikacja podpisu
const expectedSignature = crypto
  .createHmac("sha256", config.orderSignatureSecret)
  .update(`${orderNumber}:${timestamp}`)
  .digest("hex");

// Sprawdzenie czy podpis jest poprawny
if (signature !== expectedSignature) {
  return {
    verified: false,
    error: "Nieprawidłowy podpis URL",
  };
}
```

### 3. Zabezpieczenie interfejsu użytkownika

Komponent `success.vue` korzysta z API weryfikacji i wyświetla dane tylko dla zweryfikowanych zamówień:

```typescript
// Weryfikacja podpisu URL na serwerze
const verifyOrderSignature = async () => {
  const result = await $fetch('/api/orders/verify-signature', {...});

  if (result.verified) {
    isOrderVerified.value = true;
    // Pokazujemy dane zamówienia
  } else {
    // Pokazujemy błąd i przekierowujemy do sklepu
    setTimeout(() => navigateTo('/shop'), 3000);
  }
};
```

### 4. Globalne middleware bezpieczeństwa

Dodatkowe middleware `secure-redirect.global.ts` stanowi ostatnią linię obrony:

```typescript
export default defineNuxtRouteMiddleware((to) => {
  if (to.path.includes("/shop/success")) {
    // Dodatkowe sprawdzenia bezpieczeństwa
    // Przekierowanie w przypadku wykrycia manipulacji
  }
});
```

## Konfiguracja

1. Ustaw zmienną środowiskową `ORDER_SIGNATURE_SECRET` z silnym, losowym kluczem:

   ```
   ORDER_SIGNATURE_SECRET="twoj_tajny_klucz_tutaj"
   ```

2. Upewnij się, że wartość tej zmiennej jest różna w środowiskach produkcyjnym i testowym
3. Nie udostępniaj tego klucza publicznie ani w repozytorium kodu

## Bezpieczeństwo

- **Brak odwracalności**: Podpisy HMAC są jednokierunkowe, nie można odzyskać oryginalnych danych z podpisu
- **Wygasanie linków**: Linki wygasają po 24 godzinach od utworzenia
- **Weryfikacja na serwerze**: Sprawdzanie podpisu odbywa się po stronie serwera, co uniemożliwia obejście zabezpieczenia po stronie klienta
