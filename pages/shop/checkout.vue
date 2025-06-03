<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Dane do zamówienia</h1>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <form @submit.prevent="handlePayment" class="space-y-6">
          <div class="space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700"
                >Imię i nazwisko</label
              >
              <input
                id="name"
                v-model="formData.name"
                type="text"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700"
                >Email</label
              >
              <input
                id="email"
                v-model="formData.email"
                type="email"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700"
                >Telefon</label
              >
              <input
                id="phone"
                v-model="formData.phone"
                type="tel"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  for="street"
                  class="block text-sm font-medium text-gray-700"
                  >Ulica</label
                >
                <input
                  id="street"
                  v-model="formData.street"
                  type="text"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div>
                <label
                  for="houseNumber"
                  class="block text-sm font-medium text-gray-700"
                  >Numer domu/mieszkania</label
                >
                <input
                  id="houseNumber"
                  v-model="formData.houseNumber"
                  type="text"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  for="postalCode"
                  class="block text-sm font-medium text-gray-700"
                  >Kod pocztowy</label
                >
                <input
                  id="postalCode"
                  v-model="formData.postalCode"
                  type="text"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div>
                <label
                  for="city"
                  class="block text-sm font-medium text-gray-700"
                  >Miasto</label
                >
                <input
                  id="city"
                  v-model="formData.city"
                  type="text"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label
                for="country"
                class="block text-sm font-medium text-gray-700"
                >Kraj</label
              >
              <select
                id="country"
                v-model="formData.country"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              >
                <option value="PL">Polska</option>
                <option value="DE">Niemcy</option>
                <option value="US">Stany Zjednoczone</option>
              </select>
            </div>
          </div>

          <div
            v-if="errorMessage"
            class="mb-4 p-4 bg-red-100 text-red-700 rounded-md"
          >
            {{ errorMessage }}
          </div>

          <button
            type="submit"
            :disabled="submitting || cartItems.length === 0"
            class="w-full py-3 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {{ submitting ? "Przetwarzanie..." : "Przejdź do płatności" }}
          </button>
        </form>
      </div>

      <div class="lg:col-span-1">
        <div class="bg-gray-50 rounded-lg p-6 sticky top-4">
          <h2 class="text-xl font-semibold mb-4">Podsumowanie zamówienia</h2>
          <div class="space-y-4">
            <div
              v-for="item in cartItems"
              :key="item.id"
              class="flex justify-between"
            >
              <span class="text-gray-600"
                >{{ item.product.name }} x {{ item.quantity }}</span
              >
              <span class="font-medium">{{
                formatPrice(item.product.price * item.quantity)
              }}</span>
            </div>
            <div class="border-t pt-4 mt-4">
              <div class="flex justify-between">
                <span class="text-lg font-bold">Suma:</span>
                <span class="text-lg font-bold">{{
                  formatPrice(totalPrice)
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from "~/stores/shop/cart";
import { useProductsStore } from "~/stores/shop/products";
import { useStripe } from "~/composables/useStripe";

const cartStore = useCartStore();
const productsStore = useProductsStore();
const { stripe } = useStripe();
const submitting = ref(false);
const errorMessage = ref("");

const formData = ref({
  name: "",
  email: "",
  phone: "",
  street: "",
  houseNumber: "",
  postalCode: "",
  city: "",
  country: "PL",
});

const cartItems = computed(() => {
  return cartStore.items.map((item) => ({
    ...item,
    product: productsStore.getProduct(item.id)!,
  }));
});

const totalPrice = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);
});

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(price);
};

const handlePayment = async () => {
  if (cartItems.value.length === 0) return;

  try {
    submitting.value = true;
    errorMessage.value = "";

    // Utwórz sesję płatności
    const response = await fetch("/api/stripe/create-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: cartItems.value.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
        customer: {
          name: formData.value.name,
          email: formData.value.email,
          phone: formData.value.phone,
          address: {
            street: formData.value.street,
            houseNumber: formData.value.houseNumber,
            postalCode: formData.value.postalCode,
            city: formData.value.city,
            country: formData.value.country,
          },
        },
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(
        responseData.message || "Failed to create payment session"
      );
    }

    console.log("Session ID received:", responseData.sessionId);

    // Poczekaj na załadowanie Stripe
    const stripeInstance = await stripe;

    if (!stripeInstance) {
      throw new Error("Could not initialize Stripe");
    }

    console.log("Redirecting to Stripe checkout...");

    // Przekieruj do Stripe Checkout
    const { error } = await stripeInstance.redirectToCheckout({
      sessionId: responseData.sessionId,
    });

    if (error) {
      console.error("Stripe redirect error:", error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Payment error:", error);
    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Wystąpił błąd podczas przetwarzania płatności. Spróbuj ponownie.";
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.container {
  max-width: 1200px;
}

.sticky {
  position: -webkit-sticky;
  position: sticky;
  top: 1rem;
}
</style>
