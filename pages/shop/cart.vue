<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Koszyk</h1>
    <div v-if="cartItems.length > 0">
      <div class="space-y-4">
        <div
          v-for="item in cartItems"
          :key="item.id"
          class="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
        >
          <img
            :src="item.product.image"
            :alt="item.product.name"
            class="w-24 h-24 object-cover rounded-md"
          />
          <div class="flex-1">
            <h3 class="text-xl font-semibold">{{ item.product.name }}</h3>
            <div class="flex flex-col gap-1">
              <p
                class="text-lg"
                :class="{ 'line-through text-gray-400': item.discount }"
              >
                {{ formatPrice(item.product.price) }} / szt.
              </p>
              <p
                v-if="item.discount"
                class="text-lg text-green-600 font-semibold"
              >
                {{ formatPrice(item.finalPrice) }} / szt. (-{{
                  item.discount
                }}%)
              </p>
              <p class="text-sm text-gray-600">
                Suma:
                {{
                  formatPrice(
                    item.finalPrice
                      ? item.finalPrice * item.quantity
                      : item.product.price * item.quantity
                  )
                }}
              </p>
            </div>
            <div class="flex items-center gap-4 mt-2">
              <div class="flex items-center space-x-2">
                <button
                  @click="decreaseQuantity(item.id)"
                  class="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
                >
                  -
                </button>
                <span class="w-8 text-center">{{ item.quantity }}</span>
                <button
                  @click="increaseQuantity(item.id)"
                  class="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
                  :disabled="!canIncreaseQuantity(item.id)"
                >
                  +
                </button>
                <div
                  v-if="isLimitReached(item.id)"
                  class="text-sm text-red-600 ml-2"
                >
                  Max: {{ getProductLimit(item.id) }}
                </div>
              </div>
            </div>
            <div
              v-if="item.product.discountTiers.length > 0"
              class="mt-2 text-sm text-gray-600"
            >
              <p>Dostępne progi zniżek:</p>
              <ul class="list-disc list-inside">
                <li
                  v-for="tier in item.product.discountTiers"
                  :key="tier.quantity"
                  :class="{
                    'text-green-600 font-semibold':
                      item.quantity >= tier.quantity,
                  }"
                >
                  {{ tier.quantity }}+ szt: -{{ tier.discount }}%
                </li>
              </ul>
            </div>
          </div>
          <button
            @click="removeFromCart(item.id)"
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Usuń
          </button>
        </div>
      </div>
      <div class="mt-8">
        <div class="text-2xl font-bold mb-4">
          Suma: {{ formatPrice(totalPrice) }}
        </div>
        <button
          @click="proceedToCheckout"
          class="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Przejdź do płatności
        </button>
      </div>
    </div>
    <div v-else class="text-center py-12">
      <p class="text-xl text-gray-600">Twój koszyk jest pusty</p>
      <NuxtLink
        to="/shop"
        class="inline-block mt-4 px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
      >
        Wróć do sklepu
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from "~/stores/shop/cart";
import { useProductsStore } from "~/stores/shop/products";
import { useRouter } from "vue-router";

const router = useRouter();
const cartStore = useCartStore();
const productsStore = useProductsStore();

const cartItems = computed(() => cartStore.itemsWithDiscounts);

const totalPrice = computed(() => cartStore.totalPrice);

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(price);
};

const updateQuantity = (productId: number, quantity: number) => {
  cartStore.updateQuantity(productId, quantity);
};

const removeFromCart = (productId: number) => {
  cartStore.removeFromCart(productId);
};

const proceedToCheckout = () => {
  router.push("/shop/checkout");
};

const isLimitReached = (productId: number) => {
  const item = cartItems.value.find((item) => item.id === productId);
  const product = item?.product;
  if (!item || !product) return false;
  return item.quantity >= product.orderLimit;
};

const canIncreaseQuantity = (productId: number) => {
  return !isLimitReached(productId);
};

const getProductLimit = (productId: number) => {
  const item = cartItems.value.find((item) => item.id === productId);
  return item?.product.orderLimit ?? 0;
};

const increaseQuantity = (productId: number) => {
  if (!isLimitReached(productId)) {
    cartStore.addToCart(productId);
  }
};

const decreaseQuantity = (productId: number) => {
  const item = cartStore.items.find((item) => item.id === productId);
  if (item && item.quantity > 1) {
    cartStore.updateQuantity(productId, item.quantity - 1);
  } else {
    cartStore.removeFromCart(productId);
  }
};
</script>

<style scoped>
.cart-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #ddd;
  margin-bottom: 1rem;
  border-radius: 8px;
}

.cart-item img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.item-details {
  flex: 1;
  margin: 0 1rem;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.quantity-controls button {
  padding: 0.5rem 1rem;
}

.remove-button {
  padding: 0.5rem 1rem;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cart-summary {
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.checkout-button,
.continue-shopping {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #2ecc71;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  margin-top: 1rem;
}

.empty-cart {
  text-align: center;
  padding: 2rem;
}
</style>
