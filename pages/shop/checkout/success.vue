<template>
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
      <div class="flex flex-col items-center text-center mb-8">
        <div class="bg-green-100 p-3 rounded-full mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-12 w-12 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">
          Dziękujemy za zakup!
        </h1>
        <p class="text-gray-600 text-lg">
          Twoje zamówienie zostało pomyślnie złożone.
        </p>
        <p v-if="orderNumber" class="mt-4 text-gray-700 font-medium">
          Numer zamówienia: <span class="font-bold">{{ orderNumber }}</span>
        </p>
      </div>

      <div class="border-t border-gray-200 py-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Co dalej?</h2>
        <ul class="space-y-3 text-gray-700">
          <li class="flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-green-500 mr-2 mt-0.5"
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
            <span>
              Wysłaliśmy potwierdzenie zamówienia na Twój adres e-mail.
            </span>
          </li>
          <li class="flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-green-500 mr-2 mt-0.5"
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
            <span>
              Nasz zespół rozpocznie realizację Twojego zamówienia w najbliższym
              czasie.
            </span>
          </li>
          <li class="flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-green-500 mr-2 mt-0.5"
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
            <span>
              O zmianie statusu zamówienia będziemy informować Cię mailowo.
            </span>
          </li>
        </ul>
      </div>

      <div class="flex justify-center space-x-4">
        <NuxtLink
          to="/shop"
          class="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Kontynuuj zakupy
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useCartStore } from "~/stores/shop/cart";

const route = useRoute();
const orderNumber = computed(() => (route.query.order as string) || null);

onMounted(() => {
  // Wyczyść koszyk, jeśli jeszcze nie został wyczyszczony
  // To zabezpieczenie na wypadek, gdyby użytkownik wrócił do strony potwierdzenia
  try {
    const cartStore = useCartStore();
    if (cartStore.items.length > 0) {
      cartStore.$patch({ items: [] });
    }
  } catch (error) {
    console.error("Błąd podczas czyszczenia koszyka:", error);
  }
});
</script>

<style scoped>
/* Dodatkowe style można dodać tutaj */
</style>
