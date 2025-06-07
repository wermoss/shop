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
            <p class="text-gray-600">{{ item.product?.price }} zł</p>
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
          <button
            @click="cartStore.removeFromCart(item.id)"
            class="text-red-500"
          >
            Usuń
          </button>
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
                class="text-sm text-green-600"
              >
                Otrzymujesz {{ cartStore.cartDiscount }}% rabatu za zakup
                {{ cartStore.totalQuantity }} sztuk!
              </div>
              <template v-else>
                <div
                  v-for="tier in cartDiscountTiers"
                  :key="tier.quantity"
                  class="text-sm text-gray-500"
                >
                  <template v-if="cartStore.totalQuantity < tier.quantity">
                    Dodaj jeszcze {{ tier.quantity - cartStore.totalQuantity }}
                    {{
                      tier.quantity - cartStore.totalQuantity === 1
                        ? "sztukę"
                        : "sztuk"
                    }}
                    aby otrzymać {{ tier.discount }}% rabatu!
                  </template>
                </div>
              </template>
            </div>

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
import { useProductsStore } from "~/stores/shop/products";

const cartStore = useCartStore();
const productsStore = useProductsStore();

const cartItems = computed(() => cartStore.itemsWithDiscounts);
const cartDiscountTiers = CART_DISCOUNT_TIERS.sort(
  (a, b) => b.quantity - a.quantity
);
</script>

<style scoped>
.sticky {
  position: -webkit-sticky;
  position: sticky;
  top: 1rem;
}
/* Rest of the styles... */
</style>
