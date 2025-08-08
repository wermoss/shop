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
        <div
          class="col-span-12 lg:col-span-8 bg-[#EBEBEB] py-6"
          id="left-columm"
        >
          <div class="py-6 tracking-wider px-8">
            <!-- Uproszczony układ wykorzystujący tylko Tailwind CSS -->
            <div
              v-for="(item, index) in cartItems"
              :key="item.id"
              :class="[
                'py-6 lg:flex lg:items-center lg:gap-8 relative',
                index < cartItems.length - 1 ? 'border-b border-gray-300' : '',
              ]"
            >
              <!-- Wizerunek produktu -->
              <!-- <div
                class="aspect-square w-20 mx-auto lg:mx-0 lg:h-28 lg:w-28 bg-gray-100 flex items-center justify-center"
              >
                <img
                  :src="item.product?.image"
                  :alt="item.product?.name"
                  class="w-24 h-24 object-cover rounded bg-gray-200"
                />
              </div> -->

              <!-- Informacje o produkcie -->
              <div class="text-md lg:flex-1">
                <p class="font-semibold">{{ item.product?.name }}</p>
                <div
                  v-if="
                    item.product?.features && item.product.features.length > 0
                  "
                  class="flex flex-wrap gap-2 my-2"
                >
                  <div
                    v-for="feature in item.product.features"
                    :key="feature.name"
                    class="text-sm flex items-center"
                  >
                    <span class="font-medium text-gray-600"
                      >{{ feature.name }}:</span
                    >
                    <span
                      v-if="feature.colorCode"
                      class="ml-1 inline-block w-3 h-3 rounded-full border border-gray-300"
                      :style="{ backgroundColor: feature.colorCode }"
                      :title="feature.value"
                    ></span>
                    <span class="ml-1 text-gray-800">{{ feature.value }}</span>
                    <!-- Show color circle if colorCode exists -->
                  </div>
                </div>
                <div class="mt-2 flex items-center">
                  <!-- Discounted price or regular price -->
                  <p class="text-gray-800 font-semibold flex items-center">
                    <transition name="discount-badge" mode="out-in">
                      <div
                        :key="getTotalDiscount || 'regular'"
                        class="flex items-center"
                      >
                        <template v-if="getTotalDiscount > 0">
                          <span
                            class="bg-black text-white px-2 py-1 text-xs rounded mr-1"
                          >
                            -{{ getTotalDiscount }}%
                          </span>
                          {{ calculateDiscountedUnitPrice(item).toFixed(2) }} zł
                        </template>
                        <template v-else>
                          {{ item.product?.price.toFixed(2) }} zł
                        </template>
                      </div>
                    </transition>
                  </p>
                </div>
              </div>

              <!-- Ilość produktu -->
              <div class="inline-block w-1/2 lg:w-32 text-sm text-left">
                <div class="flex items-center mt-6">
                  <button
                    @click="cartStore.decrementQuantity(item.id)"
                    :disabled="!cartStore.canDecreaseQuantity(item.id)"
                    :class="[
                      'px-4 py-2 border-b border-t border-l border-gray-300 rounded-l-md',
                      cartStore.canDecreaseQuantity(item.id)
                        ? 'bg-transparent'
                        : ' text-gray-400 cursor-not-allowed',
                    ]"
                  >
                    -
                  </button>
                  <span class="px-4 py-2 border border-gray-300">{{
                    item.quantity
                  }}</span>
                  <button
                    @click="cartStore.incrementQuantity(item.id)"
                    :disabled="!cartStore.canIncreaseQuantity(item.id)"
                    :class="[
                      'px-4 py-2 border-b border-t border-r border-gray-300 rounded-r-md',
                      cartStore.canIncreaseQuantity(item.id)
                        ? 'bg-transparent hover:bg-gray-200'
                        : ' text-gray-400 cursor-not-allowed',
                    ]"
                    :title="
                      !cartStore.canIncreaseQuantity(item.id)
                        ? `Maksymalny limit: ${item.product?.orderLimit}`
                        : ''
                    "
                  >
                    +
                  </button>
                </div>
              </div>

              <!-- Cena produktu -->
              <div
                class="inline-block w-1/2 lg:w-24 text-[16px] font-medium text-right"
              >
                {{
                  getTotalDiscount > 0
                    ? (
                        calculateDiscountedUnitPrice(item) * item.quantity
                      ).toFixed(2)
                    : (item.product?.price * item.quantity).toFixed(2)
                }}
                zł
              </div>

              <!-- Przycisk usunięcia -->
              <button
                @click="cartStore.removeFromCart(item.id)"
                class="absolute lg:static top-6 right-0"
              >
                <div
                  class="w-6 h-6 bg-gray-250 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-400 transition-colors"
                >
                  <img
                    src="/icons/close.svg"
                    alt="Usuń produkt"
                    class="w-4 h-4"
                  />
                </div>
              </button>
            </div>

            <!-- Discount Code Input -->
            <div
              v-if="cartItems.length > 0"
              class="mt-6 border-t border-gray-300 pt-6"
            >
              <!-- Show input when no discount code is applied -->
              <div v-if="!cartStore.appliedDiscountCode">
                <div class="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div class="flex flex-1">
                    <input
                      type="text"
                      v-model="discountCode"
                      placeholder="Wpisz kod rabatowy"
                      class="px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-black w-full"
                    />
                    <button
                      @click="applyDiscountCode"
                      class="px-4 py-2 bg-black text-white rounded-r-md hover:opacity-90"
                      :disabled="!discountCode.trim()"
                    >
                      Zastosuj
                    </button>
                  </div>
                </div>
              </div>

              <!-- Show only removal option when code is applied -->
              <div v-else class="flex items-center justify-end">
                <button
                  @click="removeDiscountCode"
                  class="text-sm text-gray-600 hover:text-black underline"
                >
                  Usuń kod rabatowy
                </button>
              </div>

              <!-- Show messages (errors and warnings) -->
              <p
                v-if="codeMessage"
                class="mt-2"
                :class="codeSuccess ? 'text-yellow-600' : 'text-red-500'"
              >
                {{ codeMessage }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="cartItems.length > 0" class="grid grid-cols-12">
        <div class="col-span-12 lg:col-span-4 bg-white p-10">
          <p class="text-2xl tracking-wider">Podsumowanie</p>
          <div
            class="space-y-3 border-b border-t border-gray-200 my-6 py-6 tracking-wider"
          >
            <div class="flex justify-between">
              <p>Liczba produktów</p>
              <p class="text-right">{{ cartStore.totalQuantity }} szt.</p>
            </div>
            <div class="flex justify-between">
              <p>Wartość produktów</p>
              <p class="text-right">
                {{ cartStore.subtotalPrice.toFixed(2) }} zł
              </p>
            </div>
            <div class="flex justify-between">
              <p>Wartość VAT</p>
              <p class="text-right">0,00 zł</p>
            </div>
            <!-- Display only the higher discount -->
            <div
              v-if="cartStore.totalDiscount > 0"
              class="flex justify-between"
            >
              <p>
                {{
                  cartStore.cartDiscount >= cartStore.codeDiscount
                    ? `Rabat ilościowy -${cartStore.cartDiscount}%`
                    : `Rabat dodatkowy -${cartStore.codeDiscount}%`
                }}
              </p>
              <p class="text-right">
                - {{ cartStore.totalDiscountAmount.toFixed(2) }} zł
              </p>
            </div>
            <div class="flex justify-between">
              <p>Koszt wysyłki</p>
              <p class="text-right">0,00 zł</p>
            </div>
          </div>
          <div class="flex justify-between text-2xl tracking-wider">
            <p>Suma</p>
            <p class="text-right">{{ cartStore.totalPrice.toFixed(2) }} zł</p>
          </div>
          <NuxtLink
            to="/shop/checkout"
            class="block w-full bg-black text-white py-4 rounded-full hover:opacity-100 opacity-90 transition-all mt-16 cursor-pointer text-center"
          >
            Przejdź do zamówienia
          </NuxtLink>
        </div>
      </div>

      <div v-else class="grid grid-cols-12">
        <div
          class="col-span-12 lg:col-span-8 bg-[#EBEBEB] p-10 flex flex-col items-center justify-center min-h-[50vh]"
        >
          <img
            src="/images/empty-cart.png"
            alt="Empty Cart"
            class="mx-auto w-[450px] h-auto mb-6"
          />
          <p class="text-3xl text-gray-600 mb-4 tracking-wide text-center">
            Twój koszyk jest pusty
          </p>
          <NuxtLink
            to="/shop"
            class="inline-block px-8 py-3 bg-black text-white rounded-full hover:opacity-100 opacity-90 transition-all"
          >
            Wróć do sklepu
          </NuxtLink>
        </div>
        <div class="col-span-12 lg:col-span-4 bg-white p-10">
          <!-- Empty cart summary placeholder -->
          <p class="text-2xl tracking-wider">Podsumowanie</p>
          <div
            class="space-y-3 border-b border-t border-gray-200 my-6 py-6 tracking-wider"
          >
            <div class="flex justify-between">
              <p>Koszyk jest pusty</p>
              <p class="text-right">0,00 zł</p>
            </div>
          </div>
          <div class="flex justify-between text-2xl tracking-wider">
            <p>Suma</p>
            <p class="text-right">0,00 zł</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "layout-cart",
});

import { useCartStore, CART_DISCOUNT_TIERS } from "~/stores/shop/cart";
import type { CartItem } from "~/types/shop";
import { useProductsStore } from "~/stores/shop/products";

const cartStore = useCartStore();
const productsStore = useProductsStore();

// Discount code handling
const discountCode = ref("");
const codeMessage = ref("");
const codeSuccess = ref(false);

// Apply discount code function
function applyDiscountCode() {
  if (!discountCode.value.trim()) return;

  // Set the discount code in the cart store
  cartStore.setDiscountCode(discountCode.value);

  // Try to apply the discount code
  const result = cartStore.applyDiscountCode();

  if (result.success) {
    // Clear the input after successful application
    discountCode.value = "";

    // Show warning if the code discount is lower than cart discount
    if (result.warning) {
      codeSuccess.value = true;
      codeMessage.value =
        result.message ||
        "Zastosowano kod rabatowy, ale rabat ilościowy jest wyższy.";

      // Clear the message after 5 seconds
      setTimeout(() => {
        codeMessage.value = "";
      }, 5000);
    }
  } else {
    // Show error or warning message
    codeSuccess.value = result.warning || false;
    codeMessage.value = result.message || "Nieprawidłowy kod rabatowy";

    // Clear the message after 5 seconds
    setTimeout(() => {
      codeMessage.value = "";
    }, 5000);
  }
}

// Remove discount code function
function removeDiscountCode() {
  cartStore.removeDiscountCode();
}

const cartItems = computed(() => cartStore.itemsWithDiscounts);
const cartDiscountTiers = CART_DISCOUNT_TIERS.sort(
  (a, b) => b.quantity - a.quantity
);

// Calculate the total discount percentage (maximum of quantity or code discount)
const getTotalDiscount = computed((): number => {
  return Math.max(cartStore.cartDiscount, cartStore.codeDiscount);
});

// Find the next discount tier that the user can reach
const nextDiscountTier = computed(() => {
  if (cartStore.cartDiscount > 0) return null; // Już mamy rabat, nie pokazujemy następnego progu

  // Sortujemy progi rosnąco (od najmniejszego do największego) i znajdujemy pierwszy osiągalny
  return [...cartDiscountTiers]
    .sort((a, b) => a.quantity - b.quantity) // Sortowanie rosnąco po ilości
    .find((tier) => tier.quantity > cartStore.totalQuantity);
});

/**
 * Calculate the discounted unit price for a cart item
 */
function calculateDiscountedUnitPrice(
  item: CartItem & { product: any }
): number {
  if (!item.product) return 0;

  const originalPrice = item.product.price;
  const discountMultiplier = 1 - getTotalDiscount.value / 100;

  // Round to 2 decimal places
  return Math.round(originalPrice * discountMultiplier * 100) / 100;
}

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

  // Cleanup on unmount
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

/* Animation for discount badge */
.discount-badge-enter-active,
.discount-badge-leave-active {
  transition: opacity 0.5s ease;
}

.discount-badge-enter-from,
.discount-badge-leave-to {
  opacity: 0;
}
</style>
