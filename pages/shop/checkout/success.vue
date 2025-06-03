<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
      <div class="mb-6">
        <div class="text-green-500 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-16 w-16 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-800 mb-2">
          Zamówienie przyjęte!
        </h1>
        <p class="text-gray-600 mb-4">Dziękujemy za zakupy w naszym sklepie.</p>
        <p class="text-gray-800 font-semibold">
          Numer zamówienia: {{ orderNumber }}
        </p>
      </div>
      <div class="mt-8 space-y-4">
        <NuxtLink
          to="/shop"
          class="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Wróć do sklepu
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["payment-success"],
  ssr: true,
});

import { onMounted, computed } from "vue";
import { useCartStore } from "~/stores/shop/cart";
import { useRoute } from "vue-router";

const route = useRoute();
console.log("Success Page - Route:", route.path);
console.log("Success Page - Query params:", route.query);

const cartStore = useCartStore();

const orderNumber = computed(() => {
  const number = route.query.order as string;
  console.log("Success Page - Order number computed:", number);
  return number;
});

onMounted(() => {
  console.log("Success Page - Component mounted");
  cartStore.clearCart();
});
</script>
