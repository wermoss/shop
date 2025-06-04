<template>
  <NuxtLayout>
    <div class="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <div class="max-w-3xl mx-auto px-4 py-16">
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div class="p-8">
            <div class="text-center">
              <div
                class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6"
              >
                <svg
                  class="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 class="text-3xl font-bold text-gray-900 mb-4">
                Płatność nie powiodła się
              </h1>
              <p class="text-xl text-gray-600 mb-8">
                Wystąpił problem podczas przetwarzania płatności
                <span v-if="orderNumber"
                  >dla zamówienia #{{ orderNumber }}</span
                >
              </p>
            </div>

            <div
              v-if="orderMetadata"
              class="border-b border-gray-200 pb-6 mb-6"
            >
              <h2 class="text-lg font-semibold text-gray-900 mb-4">
                Szczegóły zamówienia
              </h2>
              <div class="space-y-2">
                <p class="text-sm text-gray-600">
                  <span class="font-medium">Zamawiający:</span>
                  {{ orderMetadata.customerName }}
                </p>
                <p class="text-sm text-gray-600">
                  <span class="font-medium">Email:</span>
                  {{ orderMetadata.customerEmail }}
                </p>
                <p class="text-sm text-gray-600">
                  <span class="font-medium">Telefon:</span>
                  {{ orderMetadata.customerPhone }}
                </p>
                <p class="text-sm text-gray-600">
                  <span class="font-medium">Adres dostawy:</span><br />
                  {{ orderMetadata.shippingAddress }}<br />
                  {{ orderMetadata.shippingPostalCode }}
                  {{ orderMetadata.shippingCity }}<br />
                  {{ orderMetadata.shippingCountry }}
                </p>
              </div>
            </div>

            <div class="bg-red-50 rounded-xl p-6 mb-8">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">
                Co mogło pójść nie tak?
              </h2>
              <div class="space-y-3 text-gray-600">
                <p>• Niewystarczające środki na koncie</p>
                <p>• Transakcja została odrzucona przez bank</p>
                <p>• Sesja płatności wygasła</p>
                <p>• Problemy techniczne podczas przetwarzania płatności</p>
              </div>
            </div>

            <div class="space-y-4 text-center">
              <p class="text-gray-600">
                Możesz spróbować ponownie lub skontaktować się z obsługą sklepu.
              </p>
            </div>
          </div>

          <div class="bg-gray-50 px-8 py-6">
            <div class="flex justify-center space-x-4">
              <NuxtLink
                to="/shop/cart"
                class="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Spróbuj ponownie
              </NuxtLink>
              <NuxtLink
                to="/shop"
                class="inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
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

const route = useRoute();
const cartStore = useCartStore();
const orderNumber = computed(() => route.query.order);
const status = computed(() => route.query.status || "failed");
const reason = computed(() => route.query.reason || null);

// Pobierz dane zamówienia z sessionStorage
const orderMetadata = ref(null);

const failureMessage = computed(() => {
  if (status.value === "expired") {
    return "Sesja płatności wygasła. Proszę spróbować ponownie.";
  }
  if (status.value === "cancelled") {
    return "Płatność została anulowana.";
  }
  if (status.value === "failed" && reason.value) {
    return reason.value;
  }

  // Sprawdź status przekierowania ze Stripe
  const redirectStatus = route.query.redirect_status;
  if (redirectStatus === "failed") {
    return "Płatność nie powiodła się. Spróbuj ponownie lub wybierz inną metodę płatności.";
  }
  if (redirectStatus === "expired") {
    return "Sesja płatności wygasła. Proszę spróbować ponownie.";
  }

  return "Wystąpił problem z płatnością. Proszę spróbować ponownie.";
});

onMounted(() => {
  console.log("Failed page mounted");
  console.log("Route:", route.fullPath);
  console.log("Order number:", orderNumber.value);

  if (orderNumber.value) {
    const storedData = sessionStorage.getItem(`order_${orderNumber.value}`);
    if (storedData) {
      orderMetadata.value = JSON.parse(storedData);
      console.log("Order metadata:", orderMetadata.value);
    }
  }
});
</script>
