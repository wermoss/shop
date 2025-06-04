<template>
  <div class="border border-gray-200 rounded-lg p-4 max-w-sm">
    <img
      :src="product.image"
      :alt="product.name"
      class="w-full h-48 object-cover rounded-md"
    />
    <h3 class="text-xl font-semibold mt-4">{{ product.name }}</h3>
    <p class="text-gray-600 mt-2 line-clamp-2">{{ product.description }}</p>
    <p class="text-2xl font-bold text-gray-900 my-4">
      {{ formatPrice(product.price) }}
    </p>
    <div
      v-if="product.discountTiers.length > 0"
      class="text-sm text-gray-600 mb-4"
    >
      <p>Dostępne zniżki:</p>
      <ul class="list-disc list-inside">
        <li v-for="tier in product.discountTiers" :key="tier.quantity">
          {{ tier.quantity }}+ szt: -{{ tier.discount }}%
        </li>
      </ul>
    </div>
    <div class="space-y-2 mt-4">
      <div class="mt-4">
        <button
          @click="addToCart"
          :disabled="!canAddToCart"
          class="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {{ addToCartButtonText }}
        </button>
      </div>
      <div v-if="isLimitReached" class="mt-2 text-sm text-red-600">
        Osiągnięto limit {{ product.orderLimit }} szt.
      </div>
      <NuxtLink
        :to="`/shop/product/${product.id}`"
        class="block w-full py-2 px-4 text-center border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Zobacz szczegóły
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from "~/types/shop";
import { useCartStore } from "~/stores/shop/cart";

const props = defineProps<{
  product: Product;
}>();

const cartStore = useCartStore();

const isLimitReached = computed(() => {
  const cartItem = cartStore.items.find((item) => item.id === props.product.id);
  return cartItem && cartItem.quantity >= props.product.orderLimit;
});

const canAddToCart = computed(() => !isLimitReached.value);

const addToCartButtonText = computed(() => {
  if (isLimitReached.value) {
    return `Limit: ${props.product.orderLimit} szt.`;
  }
  return "Dodaj do koszyka";
});

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(price);
};

const addToCart = () => {
  if (!isLimitReached.value) {
    cartStore.addToCart(props.product.id);
  }
};
</script>
