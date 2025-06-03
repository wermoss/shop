<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="product" class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <img
          :src="product.image"
          :alt="product.name"
          class="w-full h-auto rounded-lg shadow-lg"
        />
      </div>
      <div class="space-y-6">
        <h1 class="text-3xl font-bold">{{ product.name }}</h1>
        <p class="text-gray-600 text-lg">{{ product.description }}</p>
        <p class="text-2xl font-bold">{{ formatPrice(product.price) }}</p>
        <div class="space-y-4">
          <button
            @click="addToCart"
            class="w-full md:w-auto px-8 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            Dodaj do koszyka
          </button>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-12">
      <p class="text-xl text-gray-600">Produkt nie został znaleziony</p>
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

const route = useRoute();
const cartStore = useCartStore();
const productsStore = useProductsStore();

const product = computed(() => {
  return productsStore.getProduct(Number(route.params.id));
});

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(price);
};

const addToCart = () => {
  if (product.value) {
    cartStore.addToCart(product.value.id);
  }
};
</script>
