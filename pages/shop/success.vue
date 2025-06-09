<template>
  <NuxtLayout name="clean">
    <div class="min-h-screen bg-[#EBEBEB]">
      <div class="max-w-md mx-auto py-16">
        <div class="bg-white rounded-md">
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

              <div
                v-if="orderMetadata?.vatAmount"
                class="flex justify-between items-center text-sm"
              >
                <div>VAT ({{ orderMetadata.vatRate }}%)</div>
                <div>{{ formatPrice(orderMetadata.vatAmount) }} zł</div>
              </div>

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

          <!-- <div class="bg-gray-50 px-8 py-6">
            <div class="flex justify-center">
              <NuxtLink
                to="/shop"
                class="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                Wróć do sklepu
              </NuxtLink>
            </div>
          </div> -->
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
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

// Używamy bezpośrednio wartości total i rabatu z orderMetadata, bez ponownego obliczania

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
          const parsedData = JSON.parse(storedData);
          orderMetadata.value = parsedData;
          console.log("Sparsowane dane zamówienia:", parsedData);
          if (!parsedData.products) {
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
