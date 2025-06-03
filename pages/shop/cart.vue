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
            <p class="text-lg text-gray-600">
              {{ formatPrice(item.product.price) }}
            </p>
            <div class="flex items-center gap-4 mt-2">
              <button
                @click="updateQuantity(item.id, item.quantity - 1)"
                :disabled="item.quantity <= 1"
                class="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
              >
                -
              </button>
              <span class="text-lg">{{ item.quantity }}</span>
              <button
                @click="updateQuantity(item.id, item.quantity + 1)"
                :disabled="item.quantity >= item.product.stock"
                class="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
              >
                +
              </button>
              <span class="text-sm text-gray-500">
                (dostępne: {{ item.product.stock }} szt.)
              </span>
            </div>
            <div
              v-if="quantityErrors[item.id]"
              class="text-red-500 text-sm mt-1"
            >
              Nie można dodać więcej sztuk - przekroczono stan magazynowy
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

      <div class="mt-8 p-6 border border-gray-200 rounded-lg">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">Suma</h3>
          <p class="text-2xl font-bold">{{ formatPrice(totalPrice) }}</p>
        </div>
        <NuxtLink
          to="/shop/checkout"
          class="block w-full py-3 px-4 bg-green-500 text-white text-center rounded-md hover:bg-green-600"
        >
          Zamówienie
        </NuxtLink>
      </div>
    </div>
    <div v-else class="text-center py-12">
      <p class="text-xl text-gray-600 mb-4">Twój koszyk jest pusty</p>
      <NuxtLink
        to="/shop"
        class="inline-block py-2 px-6 bg-green-500 text-white rounded-md hover:bg-green-600"
      >
        Wróć do sklepu
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from "~/stores/shop/cart";
import { useProductsStore } from "~/stores/shop/products";

const cartStore = useCartStore();
const productsStore = useProductsStore();
const quantityErrors = ref<{ [key: number]: boolean }>({});

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

const updateQuantity = (productId: number, quantity: number) => {
  const success = cartStore.updateQuantity(productId, quantity);
  if (!success) {
    quantityErrors.value[productId] = true;
    setTimeout(() => {
      quantityErrors.value[productId] = false;
    }, 3000);
  }
};

const removeFromCart = (productId: number) => {
  cartStore.removeFromCart(productId);
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
