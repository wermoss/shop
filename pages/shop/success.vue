<template>
  <div class="min-h-screen bg-[#EBEBEB]">
    <div class="max-w-md mx-auto py-16">
      <!-- Komunikat o błędzie weryfikacji -->
      <div
        v-if="verificationError"
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
        role="alert"
      >
        <strong class="font-bold">Błąd weryfikacji!</strong>
        <span class="block sm:inline"> {{ verificationError }}</span>
        <p class="mt-2">Zostaniesz przekierowany do strony sklepu...</p>
      </div>

      <div v-if="isOrderVerified" class="bg-white rounded-md">
        <!-- Order Details -->
        <div
          class="max-w-lg mx-auto px-10 py-10 bg-white font-roboto-mono text-black text-sm"
        >
          <!-- Order Number and Date -->
          <div class="mb-10">
            <div class="flex justify-between items-center">
              <div class="text-gray-600">Numer zamówienia</div>
              <div class="text-gray-600">Data zamówienia</div>
            </div>
            <div class="flex justify-between items-center">
              <div>{{ orderNumber }}</div>
              <div>{{ orderTimestamp }}</div>
            </div>
          </div>

          <!-- Products List -->
          <div v-if="orderMetadata?.products" class="mb-6">
            <div
              v-for="product in orderMetadata.products"
              :key="product.id"
              class="flex justify-between items-top"
            >
              <div class="flex-1">
                <div>{{ product.name }}</div>
                <div class="">
                  {{ product.quantity }} szt. ×
                  {{ formatPrice(product.price) }} zł
                </div>
              </div>
              <div class="">
                {{ formatPrice(product.price * product.quantity) }} zł
              </div>
            </div>
          </div>

          <div class="border-t border-gray-200 py-6">
            <div class="flex justify-between items-center">
              <div>Wartość produktów</div>
              <div>{{ formatPrice(orderMetadata?.subtotal || 0) }} zł</div>
            </div>

            <!-- VAT - always show even if zero -->
            <div class="flex justify-between items-center">
              <div>Wartość VAT</div>
              <div>{{ formatPrice(orderMetadata?.vatAmount || 0) }} zł</div>
            </div>

            <!-- Show the applied discount (using the higher of the two) -->
            <div
              v-if="showNewDiscountFormat"
              class="flex justify-between items-center"
            >
              <div>
                {{ getDiscountTypeLabel() }}
                ({{ orderMetadata?.appliedDiscountPercent || 0 }}%)
                {{
                  orderMetadata?.appliedDiscountType === "code" &&
                  orderMetadata?.appliedDiscountCode
                    ? " (kod: " + orderMetadata.appliedDiscountCode + ")"
                    : ""
                }}
              </div>
              <div>
                -{{ formatPrice(orderMetadata?.appliedDiscountAmount || 0) }}
                zł
              </div>
            </div>

            <!-- Fallback for backward compatibility -->
            <template v-else>
              <div
                v-if="
                  orderMetadata?.quantityDiscount &&
                  orderMetadata.quantityDiscount > 0
                "
                class="flex justify-between items-center"
              >
                <div>
                  Rabat ilościowy ({{
                    orderMetadata.cartDiscountPercent || 10
                  }}%)
                </div>
                <div>-{{ formatPrice(orderMetadata.quantityDiscount) }} zł</div>
              </div>

              <div
                v-if="
                  orderMetadata?.couponDiscount &&
                  orderMetadata.couponDiscount > 0
                "
                class="flex justify-between items-center"
              >
                <div>
                  Rabat dodatkowy
                  {{
                    orderMetadata.codeDiscountPercent &&
                    orderMetadata.codeDiscountPercent > 0
                      ? "(" + orderMetadata.codeDiscountPercent + "%)"
                      : ""
                  }}
                  {{
                    orderMetadata.appliedDiscountCode
                      ? " (kod: " + orderMetadata.appliedDiscountCode + ")"
                      : ""
                  }}
                </div>
                <div>-{{ formatPrice(orderMetadata.couponDiscount) }} zł</div>
              </div>
            </template>

            <!-- Shipping cost -->
            <div class="flex justify-between items-center">
              <div>Koszt wysyłki</div>
              <div>{{ formatPrice(orderMetadata?.shippingCost || 0) }} zł</div>
            </div>

            <div class="flex justify-between items-center pt-6 font-bold">
              <div>Suma</div>
              <div>{{ formatPrice(orderMetadata?.total || 0) }} zł</div>
            </div>
          </div>

          <!-- Customer Details -->
          <div v-if="orderMetadata">
            <!-- Dane klienta -->
            <div class="border-t border-gray-200 py-6">
              <div class="grid grid-cols-1">
                <div class="flex">
                  <span class="text-gray-800">{{
                    orderMetadata.customerName
                  }}</span>
                </div>
                <div class="flex">
                  <span class="text-gray-800">{{
                    orderMetadata.customerEmail
                  }}</span>
                </div>
                <div v-if="orderMetadata.customerPhone" class="flex">
                  <span class="text-gray-800">{{
                    orderMetadata.customerPhone
                  }}</span>
                </div>
              </div>
            </div>

            <!-- Adres wysyłki -->
            <div class="border-t border-gray-200 py-6">
              <div class="grid grid-cols-1">
                <div class="flex">
                  <span class="text-gray-800">{{
                    orderMetadata.shippingAddress
                  }}</span>
                </div>
                <div class="flex">
                  <span class="text-gray-800"
                    >{{ orderMetadata.shippingPostalCode }}
                    {{ orderMetadata.shippingCity }},
                    {{ orderMetadata.shippingCountry }}</span
                  >
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <p class="text-gray-600">
              Dodatkowe podsumowanie zamówienia oraz kod rabatowy na następne
              zakupy wysłaliśmy na wskazany przez Ciebie adres email.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "layout-cart",
});

import { useCartStore, CART_DISCOUNT_TIERS } from "~/stores/shop/cart";
import type { OrderMetadata } from "~/types/shop";
import discountsData from "~/data/discounts.json";

const route = useRoute();
const cartStore = useCartStore();
const orderMetadata = ref<OrderMetadata | null>(null);
const orderNumber = computed(() => route.query.order as string);
const orderTimestamp = computed(() => {
  const timestamp = route.query.timestamp as string;
  if (!timestamp) return new Date().toLocaleString("pl-PL");
  return new Date(parseInt(timestamp)).toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

// Formatowanie ceny w stylu polskim
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

// Helper function to determine if we should use the new discount format
const showNewDiscountFormat = computed(() => {
  return (
    orderMetadata.value?.appliedDiscountAmount !== undefined &&
    orderMetadata.value?.appliedDiscountAmount > 0
  );
});

// Helper function to get the discount type label
function getDiscountTypeLabel() {
  if (!orderMetadata.value?.appliedDiscountType) return "Rabat";

  return orderMetadata.value.appliedDiscountType === "quantity"
    ? "Rabat ilościowy"
    : "Rabat dodatkowy";
}

// Zmienna do przechowywania statusu weryfikacji
const isOrderVerified = ref(false);
const verificationError = ref("");

// Weryfikacja podpisu URL na serwerze
const verifyOrderSignature = async () => {
  try {
    const { order, timestamp, signature } = route.query;

    // Wywołaj API do weryfikacji podpisu
    const result = await $fetch("/api/orders/verify-signature", {
      method: "GET",
      params: {
        order,
        timestamp,
        signature,
      },
    });

    console.log("Wynik weryfikacji podpisu:", result);

    if (result.verified) {
      isOrderVerified.value = true;
      // Tutaj możemy pobrać dane zamówienia z serwera
    } else {
      // Poprawiono dostęp do właściwości error za pomocą bezpiecznego sprawdzenia typów
      verificationError.value = "Nie udało się zweryfikować zamówienia";
      if ("error" in result && typeof result.error === "string") {
        verificationError.value = result.error;
      }
      console.error("Błąd weryfikacji:", verificationError.value);
      // Przekierowanie nastąpi po krótkim opóźnieniu
      setTimeout(() => {
        navigateTo("/shop");
      }, 3000);
    }
  } catch (error) {
    console.error("Błąd podczas weryfikacji zamówienia:", error);
    verificationError.value = "Wystąpił błąd podczas weryfikacji";
    // Przekierowanie nastąpi po krótkim opóźnieniu
    setTimeout(() => {
      navigateTo("/shop");
    }, 3000);
  }
};

onMounted(async () => {
  console.log("Success page mounted");
  cartStore.clearCart();

  // Najpierw weryfikujemy podpis URL na serwerze
  await verifyOrderSignature();

  // Jeśli podpis jest poprawny, pobieramy dane zamówienia
  if (isOrderVerified.value && process.client && orderNumber.value) {
    // Tutaj możemy pobrać dane zamówienia z sessionStorage lub z serwera
    const storedData = sessionStorage.getItem(`order_${orderNumber.value}`);

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        orderMetadata.value = parsedData;
        console.log("Sparsowane dane zamówienia:", parsedData);
      } catch (e) {
        console.error("Błąd parsowania danych zamówienia:", e);
      }
    } else {
      console.warn("Nie znaleziono danych zamówienia w sessionStorage");
      // Tutaj możemy dodać logikę pobierania danych z serwera
    }
  }
});
</script>
