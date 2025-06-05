<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Dane do zamówienia</h1>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <VeeForm
          @submit="handlePayment"
          :validation-schema="schema"
          v-slot="{ errors, meta }"
        >
          <div class="space-y-6">
            <div class="space-y-4">
              <div>
                <label
                  for="name"
                  class="block text-sm font-medium text-gray-700"
                  >Imię i nazwisko</label
                >
                <VeeField
                  name="name"
                  type="text"
                  v-model="formData.name"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  :class="{ 'border-red-300': errors.name }"
                />
                <VeeErrorMessage
                  name="name"
                  class="text-sm text-red-500 mt-1"
                />
              </div>

              <div>
                <label
                  for="email"
                  class="block text-sm font-medium text-gray-700"
                  >Email</label
                >
                <VeeField
                  name="email"
                  type="email"
                  v-model="formData.email"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  :class="{ 'border-red-300': errors.email }"
                />
                <VeeErrorMessage
                  name="email"
                  class="text-sm text-red-500 mt-1"
                />
              </div>

              <div>
                <label
                  for="phone"
                  class="block text-sm font-medium text-gray-700"
                  >Telefon</label
                >
                <VeeField
                  name="phone"
                  type="tel"
                  v-model="formData.phone"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  :class="{ 'border-red-300': errors.phone }"
                />
                <VeeErrorMessage
                  name="phone"
                  class="text-sm text-red-500 mt-1"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    for="street"
                    class="block text-sm font-medium text-gray-700"
                    >Ulica</label
                  >
                  <VeeField
                    name="street"
                    type="text"
                    v-model="formData.street"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    :class="{ 'border-red-300': errors.street }"
                  />
                  <VeeErrorMessage
                    name="street"
                    class="text-sm text-red-500 mt-1"
                  />
                </div>

                <div>
                  <label
                    for="houseNumber"
                    class="block text-sm font-medium text-gray-700"
                    >Numer domu/mieszkania</label
                  >
                  <VeeField
                    name="houseNumber"
                    type="text"
                    v-model="formData.houseNumber"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    :class="{ 'border-red-300': errors.houseNumber }"
                  />
                  <VeeErrorMessage
                    name="houseNumber"
                    class="text-sm text-red-500 mt-1"
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
                  <VeeField
                    name="postalCode"
                    type="text"
                    v-model="formData.postalCode"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    :class="{ 'border-red-300': errors.postalCode }"
                  />
                  <VeeErrorMessage
                    name="postalCode"
                    class="text-sm text-red-500 mt-1"
                  />
                </div>

                <div>
                  <label
                    for="city"
                    class="block text-sm font-medium text-gray-700"
                    >Miejscowość</label
                  >
                  <VeeField
                    name="city"
                    type="text"
                    v-model="formData.city"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    :class="{ 'border-red-300': errors.city }"
                  />
                  <VeeErrorMessage
                    name="city"
                    class="text-sm text-red-500 mt-1"
                  />
                </div>
              </div>

              <div>
                <label
                  for="country"
                  class="block text-sm font-medium text-gray-700"
                  >Kraj</label
                >
                <VeeField
                  name="country"
                  as="select"
                  v-model="formData.country"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                >
                  <option value="PL">Polska</option>
                </VeeField>
              </div>

              <div class="flex items-center">
                <VeeField
                  name="terms"
                  type="checkbox"
                  :value="true"
                  :unchecked-value="false"
                  v-model="formData.terms"
                  class="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label for="terms" class="ml-2 block text-sm text-gray-900">
                  Akceptuję regulamin sklepu
                </label>
                <VeeErrorMessage name="terms" class="text-red-500 ml-2" />
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
              :disabled="submitting || cartItems.length === 0 || !meta.valid"
              class="w-full py-3 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {{ submitting ? "Przetwarzanie..." : "Przejdź do płatności" }}
            </button>
          </div>
        </VeeForm>
      </div>

      <div class="lg:col-span-1">
        <div class="bg-gray-50 rounded-lg p-6 sticky top-4">
          <h2 class="text-xl font-semibold mb-4">Podsumowanie zamówienia</h2>
          <div class="space-y-4">
            <div
              v-for="item in cartItems"
              :key="item.id"
              class="flex flex-col border-b pb-2"
            >
              <div class="flex justify-between">
                <span class="text-gray-600">
                  {{ item.product.name }} x {{ item.quantity }}
                </span>
                <div class="text-right">
                  <p>{{ formatPrice(item.product.price * item.quantity) }}</p>
                </div>
              </div>
            </div>

            <!-- Podsumowanie z rabatem -->
            <div class="border-t pt-4 mt-4 space-y-2">
              <div class="flex justify-between">
                <span>Liczba produktów:</span>
                <span>{{ cartStore.totalQuantity }} szt.</span>
              </div>

              <div class="flex justify-between">
                <span>Wartość przed rabatem:</span>
                <span>{{ formatPrice(cartStore.subtotalPrice) }}</span>
              </div>

              <div
                v-if="cartStore.cartDiscount > 0"
                class="flex justify-between text-green-600 font-medium"
              >
                <span>Rabat {{ cartStore.cartDiscount }}%:</span>
                <span>-{{ formatPrice(discountValue) }}</span>
              </div>

              <div
                class="flex justify-between text-lg font-bold pt-2 border-t border-gray-300"
              >
                <span>Do zapłaty:</span>
                <span>{{ formatPrice(totalPrice) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["check-cart"],
});

import { useCartStore } from "~/stores/shop/cart";
import { useProductsStore } from "~/stores/shop/products";
import { useStripe } from "~/composables/useStripe";
import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import type { CartItem, Product } from "~/types/shop";

const schema = toTypedSchema(
  z.object({
    name: z
      .string()
      .min(6, "Podaj poprawne imię i nazwisko")
      .max(40, "Podaj poprawne imię i nazwisko")
      .regex(/^[^\d]+$/, "Podaj poprawne imię i nazwisko")
      .regex(/^.+\s.+$/, "Podaj poprawne imię i nazwisko"),
    email: z.string().email("Nieprawidłowy format adresu email"),
    phone: z
      .string()
      .regex(/^\+?[\d\s-]{9,}$/, "Nieprawidłowy format numeru telefonu"),
    street: z
      .string()
      .min(4, "Podaj poprawną nazwę ulicy")
      .max(40, "Podaj poprawną nazwę ulicy"),
    houseNumber: z
      .string()
      .min(1, "Podaj poprawne dane")
      .max(10, "Podaj poprawne dane"),
    postalCode: z
      .string()
      .regex(/^\d{2}-\d{3}$/, "Nieprawidłowy format kodu pocztowego (XX-XXX)"),
    city: z
      .string()
      .min(5, "Podaj poprawną nazwę miejscowości")
      .max(40, "Podaj poprawną nazwę miejscowości"),
    country: z.string().min(2, "Wybierz kraj"),
    terms: z.boolean().refine((val) => val === true, {
      message: "Musisz zaakceptować regulamin sklepu",
    }),
  })
);

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
  terms: false,
});

interface CartItemWithDiscount extends CartItem {
  product: Product;
  discount?: number;
  finalPrice?: number;
}

const cartItems = computed<CartItemWithDiscount[]>(
  () => cartStore.itemsWithDiscounts
);
const totalPrice = computed<number>(() => cartStore.totalPrice);
const discountValue = computed<number>(() => {
  return cartStore.subtotalPrice - cartStore.totalPrice;
});

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(price);
};

const handlePayment = async () => {
  if (cartItems.value.length === 0) return;

  let responseData;
  try {
    submitting.value = true;
    errorMessage.value = "";

    // Najpierw utwórz sesję płatności aby uzyskać numer zamówienia
    const response = await fetch("/api/stripe/create-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: cartItems.value.map((item: CartItemWithDiscount) => ({
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

    responseData = await response.json();

    if (!response.ok) {
      throw new Error(
        responseData.message || "Failed to create payment session"
      );
    }

    // Teraz wyślij powiadomienie o przejściu do płatności z numerem zamówienia
    await $fetch("/api/mail/cart-notification", {
      method: "POST",
      body: {
        cartDetails: {
          orderNumber: responseData.orderNumber,
          items: cartItems.value,
          totalPrice: totalPrice.value,
          customerEmail: formData.value.email,
          customerName: formData.value.name,
          customerPhone: formData.value.phone,
          shippingAddress: {
            street: formData.value.street,
            houseNumber: formData.value.houseNumber,
            postalCode: formData.value.postalCode,
            city: formData.value.city,
            country: formData.value.country,
          },
        },
      },
    });

    // Zapisz metadane zamówienia w sessionStorage
    const orderMetadata = {
      customerName: formData.value.name,
      customerEmail: formData.value.email,
      customerPhone: formData.value.phone,
      shippingAddress: `${formData.value.street} ${formData.value.houseNumber}`,
      shippingCity: formData.value.city,
      shippingPostalCode: formData.value.postalCode,
      shippingCountry: formData.value.country,
    };
    sessionStorage.setItem(
      `order_${responseData.orderNumber}`,
      JSON.stringify(orderMetadata)
    );

    // Zapisz ten numer zamówienia jako autoryzowany dla tej sesji
    let authorizedOrders: string[] = [];
    const storedOrders = sessionStorage.getItem("authorized_orders");
    if (storedOrders) {
      authorizedOrders = JSON.parse(storedOrders);
    }
    authorizedOrders.push(responseData.orderNumber);
    sessionStorage.setItem(
      "authorized_orders",
      JSON.stringify(authorizedOrders)
    );

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
      navigateTo("/shop/cart");
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

// Funkcja sprawdzająca parametry URL po powrocie z płatności
const checkPaymentReturn = () => {
  const orderNumber = sessionStorage.getItem("current_order_number");
  if (!orderNumber) return;

  const urlParams = new URLSearchParams(window.location.search);
  const redirectStatus = urlParams.get("redirect_status");
  const sessionId = urlParams.get("session_id");

  if (redirectStatus === "failed" || sessionId) {
    navigateTo(
      `/shop/failed?order=${orderNumber}&status=failed&error_code=payment_authentication_failed`
    );

    // Wyczyść dane sesji
    sessionStorage.removeItem("stripe_session_id");
    sessionStorage.removeItem("current_order_number");
  }
};

onMounted(() => {
  checkPaymentReturn();
});

onBeforeUnmount(() => {
  // Wyczyść dane sesji przy opuszczeniu strony
  sessionStorage.removeItem("stripe_session_id");
  sessionStorage.removeItem("current_order_number");
});
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
