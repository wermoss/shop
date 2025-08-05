<template>
  <div
    class="relative lg:min-h-screen xl:min-h-screen 2xl:min-h-screen"
    id="layout-container"
  >
    <!-- Background solution that aligns with grid -->
    <div
      class="absolute w-full h-full lg:min-h-screen xl:min-h-screen 2xl:min-h-screen"
    >
      <div class="container mx-auto h-full">
        <div class="grid grid-cols-12 h-full">
          <div class="col-span-12 lg:col-span-8 bg-white lg:bg-[#EBEBEB]"></div>
          <div class="col-span-12 lg:col-span-4 bg-white lg:bg-white"></div>
        </div>
      </div>
    </div>

    <!-- Background extensions -->
    <div
      class="absolute top-0 lg:bottom-0 left-0 right-1/3 -z-10 bg-[#EBEBEB] lg:bg-[#EBEBEB] content-height lg:min-h-screen xl:min-h-screen 2xl:min-h-screen"
    ></div>
    <div
      class="absolute top-0 lg:bottom-0 left-2/3 right-0 -z-10 bg-[#EBEBEB] lg:bg-white content-height lg:min-h-screen xl:min-h-screen 2xl:min-h-screen"
    ></div>

    <!-- Content -->
    <div class="container mx-auto relative z-10 pt-[60px]">
      <!-- Logo and Title -->

      <div class="grid grid-cols-12">
        <!-- Formularz zamówienia - Start -->
        <div class="col-span-12 lg:col-span-8 bg-[#EBEBEB]" id="left-column">
          <VeeForm
            id="checkoutForm"
            @submit="handlePayment"
            :validation-schema="schema"
            v-slot="{ errors, meta }"
            class="rounded-lg px-8 py-12"
          >
            <div class="space-y-6">
              <div class="space-y-4">
                <div>
                  <label
                    for="name"
                    class="block text-xs md:text-sm tracking-wider font-medium text-gray-500"
                    >Imię i nazwisko</label
                  >
                  <VeeField
                    name="name"
                    type="text"
                    v-model="formData.name"
                    class="block w-full border-stone-300 border-b-1 py-2 outline-none"
                    :class="{ 'border-red-300': errors.name }"
                  />
                  <VeeErrorMessage
                    name="name"
                    class="text-xs tracking-wider text-red-500 mt-1"
                  />
                </div>

                <div>
                  <label
                    for="email"
                    class="block text-xs md:text-sm tracking-wider font-medium text-gray-500"
                    >Email</label
                  >
                  <VeeField
                    name="email"
                    type="email"
                    v-model="formData.email"
                    class="block w-full border-stone-300 border-b-1 py-2 outline-none"
                    :class="{ 'border-red-300': errors.email }"
                  />
                  <VeeErrorMessage
                    name="email"
                    class="text-xs tracking-wider text-red-500 mt-1"
                  />
                </div>

                <div>
                  <label
                    for="phone"
                    class="block text-xs md:text-sm tracking-wider font-medium text-gray-500"
                    >Telefon</label
                  >
                  <VeeField
                    name="phone"
                    type="tel"
                    v-model="formData.phone"
                    class="block w-full border-stone-300 border-b-1 py-2 outline-none"
                    :class="{ 'border-red-300': errors.phone }"
                  />
                  <VeeErrorMessage
                    name="phone"
                    class="text-xs tracking-wider text-red-500 mt-1"
                  />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      for="street"
                      class="block text-xs md:text-sm tracking-wider font-medium text-gray-500"
                      >Ulica</label
                    >
                    <VeeField
                      name="street"
                      type="text"
                      v-model="formData.street"
                      class="block w-full border-stone-300 border-b-1 py-2 outline-none"
                      :class="{ 'border-red-300': errors.street }"
                    />
                    <VeeErrorMessage
                      name="street"
                      class="text-xs tracking-wider text-red-500 mt-1"
                    />
                  </div>

                  <div>
                    <label
                      for="houseNumber"
                      class="block text-xs md:text-sm tracking-wider font-medium text-gray-500"
                      >Numer domu / mieszkania</label
                    >
                    <VeeField
                      name="houseNumber"
                      type="text"
                      v-model="formData.houseNumber"
                      class="block w-full border-stone-300 border-b-1 py-2 outline-none"
                      :class="{ 'border-red-300': errors.houseNumber }"
                    />
                    <VeeErrorMessage
                      name="houseNumber"
                      class="text-xs tracking-wider text-red-500 mt-1"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      for="postalCode"
                      class="block text-xs md:text-sm tracking-wider font-medium text-gray-500"
                      >Kod pocztowy</label
                    >
                    <VeeField
                      name="postalCode"
                      type="text"
                      v-model="formData.postalCode"
                      class="block w-full border-stone-300 border-b-1 py-2 outline-none"
                      :class="{ 'border-red-300': errors.postalCode }"
                    />
                    <VeeErrorMessage
                      name="postalCode"
                      class="text-xs tracking-wider text-red-500 mt-1"
                    />
                  </div>

                  <div>
                    <label
                      for="city"
                      class="block text-xs md:text-sm tracking-wider font-medium text-gray-500"
                      >Miejscowość</label
                    >
                    <VeeField
                      name="city"
                      type="text"
                      v-model="formData.city"
                      class="block w-full border-stone-300 border-b-1 py-2 outline-none"
                      :class="{ 'border-red-300': errors.city }"
                    />
                    <VeeErrorMessage
                      name="city"
                      class="text-xs tracking-wider text-red-500 mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label
                    for="country"
                    class="block text-xs md:text-sm tracking-wider font-medium text-gray-500"
                    >Kraj</label
                  >
                  <VeeField
                    name="country"
                    type="text"
                    v-model="formData.country"
                    value="Polska"
                    disabled
                    class="block w-full border-stone-300 border-b-1 py-2 outline-none"
                  />
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

              <!-- <NuxtLink
                to="/shop/cart"
                class="block w-full border border-gray-300 text-black py-4 rounded-full hover:bg-gray-50 transition-all mt-4 cursor-pointer text-center"
              >
                Wróć do koszyka
              </NuxtLink> -->
            </div>
          </VeeForm>
        </div>
        <!-- Formularz zamówienia - End -->

        <!-- Podsumowanie zamówienia - Start -->
        <div class="col-span-12 lg:col-span-4 bg-white p-10">
          <p class="text-2xl tracking-wider">Podsumowanie</p>
          <div
            class="space-y-3 border-b border-t border-gray-200 my-6 py-6 tracking-wider"
          >
            <!-- Lista produktów -->
            <div class="mb-4">
              <div
                v-for="(item, index) in cartItems"
                :key="item.id"
                :class="{
                  'flex justify-between items-start pb-6 border-b border-gray-200': true,
                  'pt-6': index > 0,
                }"
              >
                <div class="flex-1">
                  <p class="font-medium">
                    {{ item.product.name }}
                    <span class="text-gray-500">× {{ item.quantity }}</span>
                  </p>

                  <!-- Cechy produktu -->
                  <div
                    v-if="
                      item.product.features && item.product.features.length > 0
                    "
                    class="mt-1 text-sm text-gray-500"
                  >
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="feature in item.product.features"
                        :key="feature.name"
                        class="flex items-center"
                      >
                        {{ feature.name }}: {{ feature.value }}
                        <!-- Kolorowe kółko dla cech z kolorem -->
                        <span
                          v-if="feature.colorCode"
                          class="ml-1 inline-block w-2 h-2 rounded-full border border-gray-300"
                          :style="{ backgroundColor: feature.colorCode }"
                        ></span>
                      </span>
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <p>{{ formatPrice(item.product.price * item.quantity) }}</p>
                </div>
              </div>
            </div>

            <!-- Podsumowanie -->
            <div class="flex justify-between">
              <p>Liczba produktów</p>
              <p class="text-right">{{ cartStore.totalQuantity }} szt.</p>
            </div>
            <div class="flex justify-between">
              <p>Wartość produktów</p>
              <p class="text-right">
                {{ formatPrice(cartStore.subtotalPrice) }}
              </p>
            </div>
            <div class="flex justify-between">
              <p>Wartość VAT</p>
              <p class="text-right">0,00 zł</p>
            </div>

            <!-- Cart Quantity Discount -->
            <div v-if="cartStore.cartDiscount > 0" class="flex justify-between">
              <p>Rabat ilościowy -{{ cartStore.cartDiscount }}%</p>
              <p class="text-right">
                - {{ formatPrice(cartStore.cartDiscountAmount) }}
              </p>
            </div>

            <!-- Code Discount -->
            <div
              v-if="cartStore.codeDiscount > 0"
              class="flex justify-between text-green-600"
            >
              <p>Rabat z kodu -{{ cartStore.codeDiscount }}%</p>
              <p class="text-right">
                - {{ formatPrice(cartStore.codeDiscountAmount) }}
              </p>
            </div>

            <div class="flex justify-between">
              <p>Koszt wysyłki</p>
              <p class="text-right">0,00 zł</p>
            </div>
          </div>

          <div class="flex justify-between text-2xl tracking-wider">
            <p>Suma</p>
            <p class="text-right">{{ formatPrice(totalPrice) }}</p>
          </div>

          <button
            type="submit"
            form="checkoutForm"
            :disabled="submitting || cartItems.length === 0 || !isFormValid"
            class="w-full bg-black text-white py-4 rounded-full hover:opacity-100 opacity-90 transition-all mt-8 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ submitting ? "Przetwarzanie..." : "Przejdź do płatności" }}
          </button>
        </div>
        <!-- Podsumowanie zamówienia - End -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["check-cart"],
  layout: "laytest",
});

import { useCartStore } from "~/stores/shop/cart";
import { useProductsStore } from "~/stores/shop/products";
import { useStripe } from "~/composables/useStripe";
import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import type { CartItem, Product } from "~/types/shop";
import { useForm } from "vee-validate";

const schema = toTypedSchema(
  z.object({
    name: z
      .string()
      .min(6, "Podaj poprawne imię i nazwisko")
      .max(40, "Podaj poprawne imię i nazwisko")
      .regex(/^[^\d]+$/, "Podaj poprawne imię i nazwisko")
      .regex(/^.+\s.+$/, "Podaj poprawne imię i nazwisko"),
    email: z.string().email("Podaj poprawny adres email"),
    phone: z
      .string()
      .regex(/^\+?[\d\s-]{9,}$/, "Podaj poprawny numer telefonu"),
    street: z
      .string()
      .min(4, "Podaj poprawną nazwę ulicy")
      .max(40, "Podaj poprawną nazwę ulicy"),
    houseNumber: z
      .string()
      .min(1, "Podaj poprawny numer domu")
      .max(10, "Podaj poprawny numer domu"),
    postalCode: z
      .string()
      .regex(/^\d{2}-\d{3}$/, "Podaj poprawny kod pocztowy (XX-XXX)"),
    city: z
      .string()
      .min(5, "Podaj poprawną nazwę miejscowości")
      .max(40, "Podaj poprawną nazwę miejscowości"),
    country: z.string().min(2, "Wybierz kraj"),
    terms: z.boolean().refine((val) => val === true, {
      message: "Akceptacja regulaminu jest wymagana.",
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
  country: "Polska",
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

// Computed property to check if all form fields are filled correctly
const isFormValid = computed(() => {
  // Basic presence check
  const hasAllFields =
    formData.value.name &&
    formData.value.email &&
    formData.value.phone &&
    formData.value.street &&
    formData.value.houseNumber &&
    formData.value.postalCode &&
    formData.value.city &&
    formData.value.terms;

  if (!hasAllFields) return false;

  // Additional format validations
  const nameValid =
    formData.value.name.length >= 6 &&
    formData.value.name.length <= 40 &&
    /^[^\d]+$/.test(formData.value.name) &&
    /^.+\s.+$/.test(formData.value.name);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email);

  const phoneValid = /^\+?[\d\s-]{9,}$/.test(formData.value.phone);

  const postalCodeValid = /^\d{2}-\d{3}$/.test(formData.value.postalCode);

  return nameValid && emailValid && phoneValid && postalCodeValid;
});

const handlePayment = async () => {
  // Check if there are items in the cart
  if (cartItems.value.length === 0) {
    errorMessage.value = "Twój koszyk jest pusty";
    return;
  }

  // Simple form validation
  if (
    !formData.value.name ||
    !formData.value.email ||
    !formData.value.phone ||
    !formData.value.street ||
    !formData.value.houseNumber ||
    !formData.value.postalCode ||
    !formData.value.city ||
    !formData.value.terms
  ) {
    errorMessage.value = "Proszę wypełnić wszystkie wymagane pola";
    return;
  }

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
        appliedDiscountCode: cartStore.appliedDiscountCode, // Dodanie kodu rabatowego do żądania
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
        // Dodaj podstawowe szczegóły zamówienia do metadanych przekazywanych do Stripe
        // Minimalizujemy dane, aby nie przekroczyć limitu 500 znaków
        order_details: {
          productCount: cartItems.value.length,
          subtotal: cartStore.subtotalPrice,
          discount: cartStore.subtotalPrice - totalPrice.value,
          total: totalPrice.value,
        },
      }),
    });

    responseData = await response.json();

    if (!response.ok) {
      throw new Error(
        responseData.error || "Błąd podczas tworzenia sesji płatności."
      );
    }

    // Zapisz metadane zamówienia w sessionStorage, aby użyć ich na stronie success
    // Te dane są niezależne od Stripe i służą do wyświetlenia podsumowania ZANIM webhook zaktualizuje stan
    const orderMetadata = {
      customerName: formData.value.name,
      customerEmail: formData.value.email,
      customerPhone: formData.value.phone,
      shippingAddress: `${formData.value.street} ${formData.value.houseNumber}`,
      shippingCity: formData.value.city,
      shippingPostalCode: formData.value.postalCode,
      shippingCountry: formData.value.country,
      products: cartItems.value.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price, // Cena jednostkowa produktu
        quantity: item.quantity,
      })),
      subtotal: cartStore.subtotalPrice,
      vatAmount: 0, // Placeholder, jeśli VAT nie jest jeszcze obliczony
      vatRate: 0, // Placeholder
      quantityDiscount:
        cartStore.cartDiscount > 0 ? cartStore.cartDiscountAmount : 0,
      couponDiscount:
        cartStore.codeDiscount > 0 ? cartStore.codeDiscountAmount : 0,
      cartDiscountPercent: cartStore.cartDiscount,
      codeDiscountPercent: cartStore.codeDiscount,
      appliedDiscountCode: cartStore.appliedDiscountCode,
      total: totalPrice.value,
    };

    console.log(
      "CheckoutPage: Saving to sessionStorage:",
      `order_${responseData.orderNumber}`,
      orderMetadata
    );

    sessionStorage.setItem(
      `order_${responseData.orderNumber}`,
      JSON.stringify(orderMetadata)
    );

    // Teraz wyślij powiadomienie o przejściu do płatności z numerem zamówienia
    console.log(
      "CheckoutPage: Sending cart notification email to",
      formData.value.email
    );

    try {
      const emailResult = await $fetch("/api/mail/cart-notification", {
        method: "POST",
        body: {
          cartDetails: {
            orderNumber: responseData.orderNumber,
            items: cartItems.value,
            totalPrice: totalPrice.value,
            cartDiscountPercent: cartStore.cartDiscount,
            codeDiscountPercent: cartStore.codeDiscount,
            discountCode: cartStore.appliedDiscountCode,
            customerEmail: formData.value.email, // Upewnij się że to pole jest wypełnione
            customerName: formData.value.name,
            customerPhone: formData.value.phone,
            cartUrl: `${window.location.origin}/shop/checkout`, // Dodaj adres powrotu do koszyka
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

      console.log("CheckoutPage: Cart notification email result:", emailResult);
    } catch (emailError) {
      console.error(
        "CheckoutPage: Error sending cart notification:",
        emailError
      );
      // Nie przerywamy procesu zamówienia, jeśli email nie został wysłany
    }

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

// Script to adjust background height based on content
onMounted(() => {
  const adjustBackgroundHeight = () => {
    if (window.innerWidth < 1024) {
      // lg breakpoint in Tailwind
      const leftColumn = document.getElementById("left-column");
      const bgElements = document.querySelectorAll(".content-height");

      if (leftColumn && bgElements.length) {
        const height = leftColumn.offsetHeight + 60; // 60px is the padding-top
        bgElements.forEach((el) => {
          (el as HTMLElement).style.height = `${height}px`;
          (el as HTMLElement).style.bottom = "auto";
        });
      }
    } else {
      // Restore default styles for larger screens
      const bgElements = document.querySelectorAll(".content-height");
      bgElements.forEach((el) => {
        (el as HTMLElement).style.height = "100vh";
        (el as HTMLElement).style.bottom = "0";
      });
    }
  };

  // Run the function on load and on resize
  adjustBackgroundHeight();
  window.addEventListener("resize", adjustBackgroundHeight);

  // Additional cleanup
  onUnmounted(() => {
    window.removeEventListener("resize", adjustBackgroundHeight);
  });
});
</script>

<style scoped>
@media (max-width: 1023px) {
  #layout-container {
    min-height: auto;
  }
}

@media (min-width: 1024px) {
  #layout-container {
    min-height: 100vh;
  }
}
</style>
