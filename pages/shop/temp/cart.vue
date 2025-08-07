<template>
  <div
    class="relative lg:min-h-screen xl:min-h-screen 2xl:min-h-screen"
    id="layout-container"
  >
    <!-- Background solution that aligns with grid -->
    <div
      class="absolute w-full h-full lg:min-h-screen xl:min-h-screen 2xl:min-h-screen"
    >
      <div class="container mx-auto min-h-full">
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

      <div v-if="cartItems.length > 0" class="grid grid-cols-12">
        <div
          class="col-span-12 lg:col-span-8 bg-[#EBEBEB] p-10"
          id="left-column"
        >
          <div
            v-for="item in cartItems"
            :key="item.id"
            class="flex items-center space-x-4 mb-4 p-4 bg-white rounded-lg shadow"
          >
            <img
              :src="item.product?.image"
              :alt="item.product?.name"
              class="w-24 h-24 object-cover rounded bg-gray-200"
            />
            <div class="flex-1">
              <h3 class="text-lg font-semibold">{{ item.product?.name }}</h3>

              <!-- Product Attributes/Features -->
              <div
                v-if="
                  item.product?.features && item.product.features.length > 0
                "
                class="flex flex-wrap gap-2 my-1"
              >
                <div
                  v-for="feature in item.product.features"
                  :key="feature.name"
                  class="text-sm flex items-center"
                >
                  <span class="font-medium text-gray-600"
                    >{{ feature.name }}:</span
                  >
                  <span class="ml-1 text-gray-800">{{ feature.value }}</span>
                  <!-- Show color circle if colorCode exists -->
                  <span
                    v-if="feature.colorCode"
                    class="ml-1 inline-block w-3 h-3 rounded-full border border-gray-300"
                    :style="{ backgroundColor: feature.colorCode }"
                    :title="feature.value"
                  ></span>
                </div>
              </div>

              <!-- Price information with discounts -->
              <div class="mt-1 flex items-center">
                <!-- Original price when there's a discount -->
                <p
                  v-if="getTotalDiscount > 0"
                  class="text-gray-400 line-through mr-4"
                >
                  {{ item.product?.price.toFixed(2) }} zł
                </p>

                <!-- Discounted price or regular price -->
                <p class="text-gray-800 font-semibold flex items-center">
                  <template v-if="getTotalDiscount > 0">
                    <span
                      class="bg-black text-white px-1 py-0.5 text-xs rounded mr-1"
                      >-{{ getTotalDiscount }}%</span
                    >
                    {{ calculateDiscountedUnitPrice(item).toFixed(2) }} zł
                  </template>
                  <template v-else>
                    {{ item.product?.price.toFixed(2) }} zł
                  </template>
                </p>
              </div>
            </div>
            <div>
              <div class="flex items-center space-x-2 mt-2">
                <button
                  @click="cartStore.decrementQuantity(item.id)"
                  :disabled="!cartStore.canDecreaseQuantity(item.id)"
                  :class="[
                    'px-2 py-1 rounded',
                    cartStore.canDecreaseQuantity(item.id)
                      ? 'bg-gray-100 hover:bg-gray-200'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed',
                  ]"
                >
                  -
                </button>
                <span>{{ item.quantity }}</span>
                <button
                  @click="cartStore.incrementQuantity(item.id)"
                  :disabled="!cartStore.canIncreaseQuantity(item.id)"
                  :class="[
                    'px-2 py-1 rounded',
                    cartStore.canIncreaseQuantity(item.id)
                      ? 'bg-gray-100 hover:bg-gray-200'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed',
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
            <div class="flex flex-col items-end">
              <div class="mb-2 font-semibold text-lg">
                <!-- Suma za wszystkie sztuki danego produktu -->
                <span>
                  {{
                    getTotalDiscount > 0
                      ? (
                          calculateDiscountedUnitPrice(item) * item.quantity
                        ).toFixed(2)
                      : (item.product?.price * item.quantity).toFixed(2)
                  }}
                  zł
                </span>
              </div>
              <button
                @click="cartStore.removeFromCart(item.id)"
                class="text-red-500"
              >
                Usuń
              </button>
            </div>
          </div>

          <!-- Quantity Discount Info - przeniesione pod listę produktów -->
          <div
            class="flex flex-col md:flex-row justify-between items-center mt-10"
          >
            <div class="">
              <!-- Discount notification with black left bar and message -->
              <div
                v-if="nextDiscountTier || cartStore.cartDiscount > 0"
                class="flex"
              >
                <!-- Left sidebar with discount percentage - changes to green when discount active -->
                <div
                  :class="[
                    'w-1 mr-3',
                    cartStore.cartDiscount > 0 ? 'bg-green-500' : 'bg-gray-800',
                  ]"
                ></div>

                <div class="px-2">
                  <div
                    v-if="cartStore.cartDiscount > 0"
                    class="text-green-600 font-semibold"
                  >
                    Gratulacje! Otrzymujesz {{ cartStore.cartDiscount }}% rabatu
                    na całą wartość swojego koszyka.
                  </div>
                  <div v-else-if="nextDiscountTier" class="text-gray-700">
                    Dodaj jeszcze
                    {{ nextDiscountTier.quantity - cartStore.totalQuantity }}
                    {{
                      nextDiscountTier.quantity - cartStore.totalQuantity === 1
                        ? "produkt"
                        : "produkty"
                    }}
                    do swojego koszyka, aby otrzymać rabat.
                  </div>
                </div>
              </div>
            </div>

            <!-- Discount Code Section - przeniesione pod powiadomienie o rabacie -->
            <div>
              <!-- Applied discount code -->
              <div
                v-if="cartStore.appliedDiscountCode"
                class="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded"
              >
                <div class="flex items-center space-x-2">
                  <span class="text-green-600">
                    {{ cartStore.getAppliedDiscountInfo()?.description }}
                  </span>
                  <span class="text-green-700 font-semibold">
                    (-{{ cartStore.codeDiscount }}%)
                  </span>
                </div>
                <button
                  @click="cartStore.removeDiscountCode()"
                  class="text-gray-500 hover:text-red-500"
                  title="Usuń kod rabatowy"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <!-- "Mam kod rabatowy" link and hidden input -->
              <div v-else>
                <div v-if="!showDiscountCodeInput">
                  <button
                    @click="showDiscountCodeInput = true"
                    class="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Mam kod rabatowy
                  </button>
                </div>

                <div v-if="showDiscountCodeInput" class="flex space-x-2">
                  <input
                    v-model="cartStore.discountCode"
                    type="text"
                    placeholder="Wpisz kod"
                    class="flex-1 p-2 border rounded uppercase"
                  />
                  <button
                    @click="cartStore.applyDiscountCode()"
                    class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="!cartStore.discountCodeValid"
                  >
                    Zastosuj
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
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
            <!-- Cart Quantity Discount -->
            <div v-if="cartStore.cartDiscount > 0" class="flex justify-between">
              <p>Rabat ilościowy -{{ cartStore.cartDiscount }}%</p>
              <p class="text-right">
                - {{ cartStore.cartDiscountAmount.toFixed(2) }} zł
              </p>
            </div>
            <!-- Code Discount -->
            <div
              v-if="cartStore.codeDiscount > 0"
              class="flex justify-between text-green-600"
            >
              <p>Rabat z kodu -{{ cartStore.codeDiscount }}%</p>
              <p class="text-right">
                - {{ cartStore.codeDiscountAmount.toFixed(2) }} zł
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
  layout: "clean",
});

import { useCartStore, CART_DISCOUNT_TIERS } from "~/stores/shop/cart";
import type { CartItem } from "~/types/shop";
import { useProductsStore } from "~/stores/shop/products";

const cartStore = useCartStore();
const productsStore = useProductsStore();

// Reference for toggling discount code input visibility
const showDiscountCodeInput = ref(false);

const cartItems = computed(() => cartStore.itemsWithDiscounts);
const cartDiscountTiers = CART_DISCOUNT_TIERS.sort(
  (a, b) => b.quantity - a.quantity
);

// Calculate the total discount percentage (quantity + code)
const getTotalDiscount = computed((): number => {
  return cartStore.cartDiscount + cartStore.codeDiscount;
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
</style>
