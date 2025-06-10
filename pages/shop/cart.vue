<template>
  <div class="container mx-auto px-4 py-8">
    <div
      v-if="cartItems.length > 0"
      class="grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      <!-- Cart Items List -->
      <div class="lg:col-span-2">
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
              v-if="item.product?.features && item.product.features.length > 0"
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
            <div class="mt-1 flex items-center bg-amber-500">
              <!-- Original price when there's a discount -->
              <p
                v-if="getTotalDiscount > 0"
                class="text-gray-400 line-through mr-4"
              >
                {{ item.product?.price.toFixed(2) }} zł
              </p>

              <!-- Discounted price or regular price -->
              <p
                class="text-gray-800 font-semibold bg-green-200 flex items-center"
              >
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
                class="px-2 py-1 bg-gray-100 rounded"
              >
                -
              </button>
              <span>{{ item.quantity }}</span>
              <button
                @click="cartStore.incrementQuantity(item.id)"
                class="px-2 py-1 bg-gray-100 rounded"
              >
                +
              </button>
            </div>
          </div>
          <div class="flex flex-col items-end bg-pink-100">
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
                :class="
                  cartStore.cartDiscount > 0 ? 'bg-green-600' : 'bg-black'
                "
                class="text-white py-3 px-5 flex items-center justify-center font-bold text-xl rounded-l-md"
              >
                <span
                  >-
                  {{
                    cartStore.cartDiscount > 0
                      ? cartStore.cartDiscount
                      : nextDiscountTier?.discount
                  }}%</span
                >
              </div>

              <!-- Right side with message -->
              <div class="bg-gray-100 flex items-center py-3 px-6 text-sm">
                <div v-if="cartStore.cartDiscount > 0" class="text-gray-700">
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

      <!-- Cart Summary -->
      <div class="lg:col-span-1">
        <div class="bg-white p-6 rounded-lg shadow sticky">
          <h2 class="text-xl font-semibold mb-4">Podsumowanie</h2>

          <!-- Cart Info -->
          <div class="space-y-4">
            <!-- Price Summary -->
            <div class="space-y-2">
              <div class="flex justify-between">
                <span>Liczba produktów:</span>
                <span>{{ cartStore.totalQuantity }} szt.</span>
              </div>
              <div class="flex justify-between">
                <span>Wartość produktów:</span>
                <span>{{ cartStore.subtotalPrice.toFixed(2) }} zł</span>
              </div>
              <div class="flex justify-between">
                <span>Wartość VAT:</span>
                <span>0.00 zł</span>
              </div>
              <div class="flex justify-between">
                <span>Koszt wysyłki:</span>
                <span>0.00 zł</span>
              </div>
              <!-- Cart Quantity Discount -->
              <div
                v-if="cartStore.cartDiscount > 0"
                class="flex justify-between"
              >
                <span>Rabat ilościowy ({{ cartStore.cartDiscount }}%):</span>
                <span>-{{ cartStore.cartDiscountAmount.toFixed(2) }} zł</span>
              </div>

              <!-- Code Discount -->
              <div
                v-if="cartStore.codeDiscount > 0"
                class="flex justify-between text-green-600"
              >
                <span>Rabat z kodu ({{ cartStore.codeDiscount }}%):</span>
                <span>-{{ cartStore.codeDiscountAmount.toFixed(2) }} zł</span>
              </div>

              <!-- Total -->
              <div class="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Do zapłaty:</span>
                <span>{{ cartStore.totalPrice.toFixed(2) }} zł</span>
              </div>
            </div>
          </div>

          <!-- Cart Summary Button -->
          <NuxtLink
            to="/shop/checkout"
            class="block w-full mt-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-center"
          >
            Przejdź do zamówienia
          </NuxtLink>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-xl text-gray-600 mb-4">Twój koszyk jest pusty</p>
      <NuxtLink
        to="/shop"
        class="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Wróć do sklepu
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
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
</script>

<style scoped>
.sticky {
  position: -webkit-sticky;
  position: sticky;
  top: 1rem;
}
/* Rest of the styles... */
</style>
