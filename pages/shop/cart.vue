<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Koszyk</h1>
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
            class="w-24 h-24 object-cover rounded"
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
            <div class="mt-1">
              <!-- Original price when there's a discount -->
              <p
                v-if="getTotalDiscount > 0"
                class="text-gray-400 line-through text-sm"
              >
                {{ item.product?.price.toFixed(2) }} zł/szt
              </p>

              <!-- Discounted price or regular price -->
              <p class="text-gray-800 font-semibold">
                <template v-if="getTotalDiscount > 0">
                  <span
                    class="bg-black text-white px-1 py-0.5 text-xs rounded mr-1"
                    >-{{ getTotalDiscount }}%</span
                  >
                  {{ calculateDiscountedUnitPrice(item).toFixed(2) }} zł/szt
                </template>
                <template v-else>
                  {{ item.product?.price.toFixed(2) }} zł/szt
                </template>
              </p>
            </div>

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
      </div>

      <!-- Cart Summary -->
      <div class="lg:col-span-1">
        <div class="bg-white p-6 rounded-lg shadow sticky">
          <h2 class="text-xl font-semibold mb-4">Podsumowanie</h2>

          <!-- Discount Code Section -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Kod rabatowy
            </label>
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
            <!-- Discount code input -->
            <div v-else class="flex space-x-2">
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

          <!-- Cart Info -->
          <div class="space-y-4">
            <!-- Products Summary -->
            <div class="text-sm text-gray-600">
              Liczba produktów: {{ cartStore.totalQuantity }}
            </div>
            <!-- Quantity Discount Info -->
            <div class="space-y-1">
              <div
                v-if="cartStore.cartDiscount > 0"
                class="text-sm bg-green-50 p-2 border border-green-200 rounded text-green-700"
              >
                <span class="font-semibold">Rabat ilościowy:</span> Otrzymujesz
                {{ cartStore.cartDiscount }}% rabatu za zakup
                {{ cartStore.totalQuantity }} sztuk!
                <div class="text-xs text-green-600 mt-1">
                  Cena produktów obniżona o
                  {{ cartStore.cartDiscountAmount.toFixed(2) }} zł
                </div>
              </div>
              <template v-else>
                <div
                  v-if="nextDiscountTier"
                  class="text-sm text-gray-500 bg-gray-50 p-2 border border-gray-200 rounded"
                >
                  <span class="font-medium">Rabat ilościowy:</span> Dodaj
                  jeszcze
                  {{ nextDiscountTier.quantity - cartStore.totalQuantity }}
                  {{
                    nextDiscountTier.quantity - cartStore.totalQuantity === 1
                      ? "sztukę"
                      : "sztuk"
                  }}
                  aby otrzymać {{ nextDiscountTier.discount }}% rabatu!
                </div>
              </template>
            </div>

            <!-- Coupon Discount Info został usunięty, ponieważ informacja wyświetla się już w sekcji zastosowanego kodu rabatowego -->

            <!-- Price Summary -->
            <div class="space-y-2">
              <div class="flex justify-between">
                <span>Wartość produktów:</span>
                <span>{{ cartStore.subtotalPrice.toFixed(2) }} zł</span>
              </div>

              <!-- Cart Quantity Discount -->
              <div
                v-if="cartStore.cartDiscount > 0"
                class="flex justify-between text-green-600"
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
