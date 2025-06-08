<template>
  <NuxtLayout name="clean">
    <div class="min-h-screen">
      <div class="max-w-xl mx-auto px-6 py-10 bg-black text-white">
        wershapes
      </div>
      <div
        class="max-w-xl mx-auto px-6 py-10 bg-white font-roboto-mono text-black"
      >
        <div class="flex justify-between items-center">
          <div>Numer zamówienia</div>
          <div>Data zamówienia</div>
        </div>
        <div class="flex justify-between items-center">
          <div>{{ orderNumber }}</div>
          <div>{{ orderTimestamp }}</div>
        </div>
      </div>
    </div>
    <div class="min-h-screen">
      <div class="max-w-3xl mx-auto px-4 py-16">
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div class="p-8">
            <div class="text-center">
              <div
                class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6"
              >
                <svg
                  class="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 class="text-3xl font-bold text-gray-900 mb-4">
                Dziękujemy za zamówienie!
              </h1>
              <p class="text-xl text-gray-600 mb-8">
                Twoje zamówienie zostało przyjęte do realizacji
              </p>
            </div>

            <div class="bg-gray-50 rounded-xl p-6 mb-8">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">
                Szczegóły zamówienia
              </h2>
              <div class="space-y-3">
                <div
                  class="flex justify-between items-center pb-3 border-b border-gray-200"
                >
                  <span class="text-gray-600">Numer zamówienia:</span>
                  <span class="font-mono font-medium text-gray-900">{{
                    orderNumber
                  }}</span>
                </div>
              </div>
            </div>

            <div
              v-if="orderMetadata"
              class="space-y-6 bg-gray-50 rounded-xl p-6 mb-8"
            >
              <!-- Dane klienta -->
              <div class="border-b border-gray-200 pb-4">
                <h3 class="text-md font-medium text-gray-700 mb-3">
                  Dane klienta
                </h3>
                <div class="grid grid-cols-1 gap-2 text-sm">
                  <div class="flex">
                    <span class="text-gray-500 w-32">Imię i nazwisko:</span>
                    <span class="text-gray-800 font-medium">{{
                      orderMetadata.customerName
                    }}</span>
                  </div>
                  <div class="flex">
                    <span class="text-gray-500 w-32">Email:</span>
                    <span class="text-gray-800 font-medium">{{
                      orderMetadata.customerEmail
                    }}</span>
                  </div>
                  <div v-if="orderMetadata.customerPhone" class="flex">
                    <span class="text-gray-500 w-32">Telefon:</span>
                    <span class="text-gray-800 font-medium">{{
                      orderMetadata.customerPhone
                    }}</span>
                  </div>
                </div>
              </div>

              <!-- Adres wysyłki -->
              <div>
                <h3 class="text-md font-medium text-gray-700 mb-3">
                  Adres wysyłki
                </h3>
                <div class="grid grid-cols-1 gap-2 text-sm">
                  <div class="flex">
                    <span class="text-gray-500 w-32">Adres:</span>
                    <span class="text-gray-800 font-medium">{{
                      orderMetadata.shippingAddress
                    }}</span>
                  </div>
                  <div class="flex">
                    <span class="text-gray-500 w-32">Kod pocztowy:</span>
                    <span class="text-gray-800 font-medium">{{
                      orderMetadata.shippingPostalCode
                    }}</span>
                  </div>
                  <div class="flex">
                    <span class="text-gray-500 w-32">Miejscowość:</span>
                    <span class="text-gray-800 font-medium">{{
                      orderMetadata.shippingCity
                    }}</span>
                  </div>
                  <div class="flex">
                    <span class="text-gray-500 w-32">Kraj:</span>
                    <span class="text-gray-800 font-medium">{{
                      orderMetadata.shippingCountry
                    }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-4 text-center">
              <p class="text-gray-600">
                Potwierdzenie zamówienia zostało wysłane na Twój adres email.
              </p>
              <p class="text-gray-600">
                Status zamówienia możesz sprawdzić używając numeru zamówienia.
              </p>
            </div>
          </div>

          <div class="bg-gray-50 px-8 py-6">
            <div class="flex justify-center">
              <NuxtLink
                to="/shop"
                class="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                Wróć do sklepu
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useCartStore } from "~/stores/shop/cart";
import type { OrderMetadata } from "~/types/shop";

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

console.log("Success page loaded");
console.log("Route:", route.fullPath);
console.log("Order number:", orderNumber.value);

onMounted(() => {
  console.log("Success page mounted");
  cartStore.clearCart();

  // Pobierz dane zamówienia z sessionStorage tylko w przeglądarce
  if (process.client && orderNumber.value) {
    // Sprawdź czy zamówienie jest autoryzowane
    const storedOrders = sessionStorage.getItem("authorized_orders");
    let authorizedOrders: string[] = [];

    if (storedOrders) {
      try {
        authorizedOrders = JSON.parse(storedOrders);
      } catch (e) {
        console.error("Błąd parsowania listy autoryzowanych zamówień:", e);
      }
    }

    // Pobierz dane zamówienia tylko jeśli jest autoryzowane
    if (authorizedOrders.includes(orderNumber.value)) {
      const storedData = sessionStorage.getItem(`order_${orderNumber.value}`);
      if (storedData) {
        orderMetadata.value = JSON.parse(storedData);
        console.log("Order metadata:", orderMetadata.value);
      } else {
        console.warn("Nie znaleziono danych zamówienia w sessionStorage");
      }
    }
  }
});
</script>
