<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <div class="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
      <div class="text-center mb-8">
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
          Zamówienie złożone!
        </h1>
        <p class="text-gray-600">Dziękujemy za zakupy w naszym sklepie.</p>
      </div>

      <div class="border-t border-b border-gray-200 py-4 my-4 space-y-4">
        <div class="flex justify-between items-center">
          <span class="font-semibold">Numer zamówienia:</span>
          <span class="text-gray-800">{{ orderNumber }}</span>
        </div>

        <div v-if="orderMetadata" class="space-y-4 text-left">
          <div class="space-y-2">
            <h3 class="font-semibold">Dane kontaktowe:</h3>
            <p>{{ orderMetadata.customerName }}</p>
            <p>{{ orderMetadata.customerEmail }}</p>
            <p v-if="orderMetadata.customerPhone">
              Tel: {{ orderMetadata.customerPhone }}
            </p>
          </div>

          <div class="space-y-2">
            <h3 class="font-semibold">Adres dostawy:</h3>
            <p>{{ orderMetadata.shippingAddress }}</p>
            <p>
              {{ orderMetadata.shippingPostalCode }}
              {{ orderMetadata.shippingCity }}
            </p>
            <p>{{ orderMetadata.shippingCountry }}</p>
          </div>
        </div>
      </div>

      <div class="text-center mt-8">
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

<script setup>
const cartStore = useCartStore();
const route = useRoute();
const orderNumber = route.query.order;

// Dane zamówienia
const orderMetadata = ref(null);

// Pobierz dane zamówienia z webhooka
onMounted(async () => {
  cartStore.clearCart();

  // Pobierz dane z lokalnego storage jeśli są dostępne
  const storedMetadata = sessionStorage.getItem(`order_${orderNumber}`);
  if (storedMetadata) {
    orderMetadata.value = JSON.parse(storedMetadata);
  }
});
</script>
