<template>
  <NuxtLayout name="clean">
    <div class="min-h-screen">
      <div class="max-w-xl mx-auto px-6 py-10 bg-black text-white">
        wershapes
      </div>
      <div
        class="max-w-xl mx-auto px-6 py-10 bg-white font-roboto-mono text-black"
      >
        <!-- zamówienie - Start -->
        <div class="flex justify-between items-center">
          <div>Numer zamówienia</div>
          <div>Data zamówienia</div>
        </div>
        <div class="flex justify-between items-center">
          <div>{{ orderNumber }}</div>
          <div>{{ orderTimestamp }}</div>
        </div>
        <!-- zamówienie - Koniec -->
        <!-- Produkty - Start -->
        <div>
          <div class="flex justify-between items-center">
            <div>Betonowe dłonie z mchem</div>
            <div>200,00</div>
          </div>
          <div class="flex justify-between items-center">
            <div>Betonowe dłonie z mchem</div>
            <div>200,00</div>
          </div>
        </div>
        <!-- Produkty - Koniec -->
        <!-- Podsumowanie - Start -->
        <div>
          <div class="flex justify-between items-center">
            <div>Wartość produktów</div>
            <div>400,00</div>
          </div>
          <div class="flex justify-between items-center">
            <div>Wartość VAT</div>
            <div>0,00</div>
          </div>
          <div class="flex justify-between items-center">
            <div>Rabat ilościowy</div>
            <div>20,00</div>
          </div>
          <div class="flex justify-between items-center">
            <div>Rabat kuponowy</div>
            <div>20,00</div>
          </div>
          <div class="flex justify-between items-center">
            <div>Suma</div>
            <div>360,00</div>
          </div>
        </div>
        <!-- Podsumowanie - Koniec -->
        <!-- Dane klienta - Start -->
        <div>
          {{ orderMetadata?.customerName }}<br />
          {{ orderMetadata?.customerEmail }}<br />
          {{ orderMetadata?.customerPhone }}<br />
        </div>
        <!-- Dane klienta - Koniec -->
        <!-- Adres wysyłki - Start -->
        <div>
          {{ orderMetadata?.shippingAddress }}<br />
          {{ orderMetadata?.shippingPostalCode }}
          {{ orderMetadata?.shippingCity }}, {{ orderMetadata?.shippingCountry
          }}<br />
        </div>
        <!-- Adres wysyłki - Koniec -->
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

            <!-- Order Details -->
            <div
              class="max-w-lg mx-auto px-6 py-10 bg-white font-roboto-mono text-black space-y-8"
            >
              <!-- Order Number and Date -->
              <div class="bg-gray-100 p-4 rounded">
                <div class="flex justify-between items-center mb-2">
                  <div class="text-sm text-gray-600">Numer zamówienia</div>
                  <div class="text-sm text-gray-600">Data zamówienia</div>
                </div>
                <div class="flex justify-between items-center">
                  <div class="font-medium">{{ orderNumber }}</div>
                  <div class="font-medium">{{ orderTimestamp }}</div>
                </div>
              </div>

              <!-- Products List -->
              <div class="bg-gray-100 p-4 rounded space-y-4">
                <h3 class="font-medium mb-2">Zamówienie</h3>
                <div v-if="orderMetadata?.products" class="space-y-2">
                  <div
                    v-for="product in orderMetadata.products"
                    :key="product.id"
                    class="flex justify-between items-center text-sm border-b border-gray-200 pb-2"
                  >
                    <div class="flex-1">
                      <div>{{ product.name }}</div>
                      <div class="text-gray-600">
                        {{ product.quantity }} szt. ×
                        {{ formatPrice(product.price) }} zł
                      </div>
                    </div>
                    <div class="font-medium">
                      {{ formatPrice(product.price * product.quantity) }} zł
                    </div>
                  </div>
                </div>

                <div class="border-t border-gray-300 mt-4 pt-4 space-y-2">
                  <div class="flex justify-between items-center text-sm">
                    <div>Wartość produktów</div>
                    <div>
                      {{ formatPrice(orderMetadata?.subtotal || 0) }} zł
                    </div>
                  </div>

                  <div
                    v-if="orderMetadata?.vatAmount"
                    class="flex justify-between items-center text-sm"
                  >
                    <div>VAT ({{ orderMetadata.vatRate }}%)</div>
                    <div>{{ formatPrice(orderMetadata.vatAmount) }} zł</div>
                  </div>

                  <div
                    v-if="orderMetadata?.quantityDiscount"
                    class="flex justify-between items-center text-sm text-green-600"
                  >
                    <div>Rabat ilościowy</div>
                    <div>
                      -{{ formatPrice(orderMetadata.quantityDiscount) }} zł
                    </div>
                  </div>

                  <div
                    v-if="orderMetadata?.couponDiscount"
                    class="flex justify-between items-center text-sm text-green-600"
                  >
                    <div>Rabat kuponowy</div>
                    <div>
                      -{{ formatPrice(orderMetadata.couponDiscount) }} zł
                    </div>
                  </div>

                  <div
                    class="flex justify-between items-center font-medium pt-2 border-t border-gray-300"
                  >
                    <div>Do zapłaty</div>
                    <div>{{ formatPrice(orderMetadata?.total || 0) }} zł</div>
                  </div>
                </div>
              </div>

              <!-- Customer Details -->
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

// Formatowanie ceny w stylu polskim
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

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
      console.log("Zamówienie jest autoryzowane");
      const storedData = sessionStorage.getItem(`order_${orderNumber.value}`);
      console.log("Surowe dane z sessionStorage:", storedData);

      if (storedData) {
        try {
          orderMetadata.value = JSON.parse(storedData);
          console.log("Sparsowane dane zamówienia:", orderMetadata.value);
          if (!orderMetadata.value.products) {
            console.warn("Brak produktów w danych zamówienia!");
          }
        } catch (e) {
          console.error("Błąd parsowania danych zamówienia:", e);
        }
      } else {
        console.warn("Nie znaleziono danych zamówienia w sessionStorage");
      }
    } else {
      console.warn("Zamówienie nie jest autoryzowane!");
      console.log("Lista autoryzowanych zamówień:", authorizedOrders);
      console.log("Numer bieżącego zamówienia:", orderNumber.value);
    }
  }
});
</script>
