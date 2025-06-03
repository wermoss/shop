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
    <div class="space-y-2 mt-4">
      <button
        @click="addToCart"
        class="w-full py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600"
      >
        Dodaj do koszyka
      </button>
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

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(price);
};

const addToCart = () => {
  cartStore.addToCart(props.product.id);
};
</script>
