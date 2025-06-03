<template>
  <div class="min-h-screen bg-gradient-to-b from-green-50 to-white">
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
                  route.query.order
                }}</span>
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
</template>

<script setup lang="ts">
import { useCartStore } from "~/stores/shop/cart";

const route = useRoute();
const cartStore = useCartStore();

console.log("Success page loaded");
console.log("Route:", route.fullPath);
console.log("Order number:", route.query.order);

onMounted(() => {
  console.log("Success page mounted");
  cartStore.clearCart();
});
</script>
